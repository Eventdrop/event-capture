import {
  getCanonicalVideoMimeType,
  isSupportedVideoExtension,
  isSupportedVideoMimeType,
  videoPolicies,
} from '@/lib/video'

export const MAX_DURATION_SECONDS = videoPolicies.video_message.maxDurationMs / 1000
export type VideoMessageState = 'selecting' | 'checking' | 'uploading' | 'finalizing' | 'success' | 'error'
export type VideoMessageError = 'type' | 'size' | 'empty' | 'duration' | 'metadata' | 'upload' | 'finalize' | 'cancelled'

export function readVideoDuration(
  file: File,
  signal: AbortSignal,
  requireVideoTrack = false,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    let settled = false
    const finish = (duration?: number) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      signal.removeEventListener('abort', abort)
      video.onloadedmetadata = null
      video.onerror = null
      video.pause()
      video.removeAttribute('src')
      video.load()
      URL.revokeObjectURL(url)
      if (duration !== undefined && Number.isFinite(duration) && duration > 0) resolve(duration)
      else reject(new Error('Video metadata unavailable'))
    }
    const abort = () => finish()
    const timer = setTimeout(() => finish(), 15000)
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      if (requireVideoTrack && (video.videoWidth <= 0 || video.videoHeight <= 0)) {
        finish()
        return
      }

      finish(video.duration)
    }
    video.onerror = () => finish()
    signal.addEventListener('abort', abort, { once: true })
    if (signal.aborted) finish()
    else video.src = url
  })
}

export function validateVideoMessage(file: File): VideoMessageError | null {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const mime = file.type.split(';', 1)[0].trim().toLowerCase()
  if (!isSupportedVideoExtension(extension) || (mime && !isSupportedVideoMimeType(extension, mime))) {
    return 'type'
  }
  if (file.size > videoPolicies.video_message.maxSizeBytes) return 'size'
  if (file.size === 0) return 'empty'
  return null
}

export async function recoverVideoAccess(identifier: string) {
  const params = new URLSearchParams({ identifier })
  const response = await fetch(`/api/public-events/access?${params.toString()}`, {
    credentials: 'same-origin',
    cache: 'no-store',
  })

  return response.ok
}

// One controller per mounted card. The synchronous lock also protects clicks
// arriving before React renders the disabled button.
export function createVideoMessageUpload(
  onState: (state: VideoMessageState, error?: VideoMessageError) => void,
) {
  let busy = false
  let cancelled = false
  let uploadController: AbortController | null = null

  async function post(
    action: string,
    body: object,
    keepalive = false,
    recoveryIdentifier?: string,
  ) {
    const request = () => fetch(`/api/videos/${action}`, {
      method: 'POST', credentials: 'same-origin', keepalive,
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    let response = await request()

    if (
      recoveryIdentifier &&
      (response.status === 401 || response.status === 403) &&
      await recoverVideoAccess(recoveryIdentifier)
    ) {
      response = await request()
    }

    const data = await response.json()
    if (!response.ok || data?.ok !== true) throw new Error('Video request failed')
    return data
  }

  return {
    cancel() {
      if (!busy) return
      cancelled = true
      uploadController?.abort()
    },
    async start(identifier: string, file: File) {
      if (busy) return
      const invalid = validateVideoMessage(file)
      if (invalid) { onState('error', invalid); return }
      busy = true
      cancelled = false
      let videoId: string | undefined
      let phase: 'metadata' | 'upload' | 'finalize' = 'metadata'
      onState('checking')
      try {
        uploadController = new AbortController()
        const extension = file.name.split('.').pop()!.toLowerCase()
        const mime = file.type.split(';', 1)[0].trim().toLowerCase()
        const duration = await readVideoDuration(
          file,
          uploadController.signal,
          extension === 'mov' && !mime,
        )
        if (cancelled) throw new Error('Cancelled')
        if (duration > MAX_DURATION_SECONDS) {
          onState('error', 'duration')
          return
        }
        phase = 'upload'
        onState('uploading')
        if (!isSupportedVideoExtension(extension)) throw new Error('Invalid video extension')
        // Do not abort initiation: we need its videoId to cancel a created row.
        const initiated = await post(
          'initiate',
          { identifier, type: 'video_message', extension },
          false,
          identifier,
        )
        if (typeof initiated.videoId === 'string') videoId = initiated.videoId
        if (!videoId || typeof initiated.signedUrl !== 'string') throw new Error('Invalid upload response')
        if (cancelled) throw new Error('Cancelled')
        uploadController = new AbortController()
        // Supabase's signed-upload endpoint accepts PUT. Use exactly the URL
        // supplied by initiation; never construct a bucket/path or send cookies.
        const response = await fetch(initiated.signedUrl, {
          method: 'PUT', credentials: 'omit', signal: uploadController.signal,
          headers: { 'Content-Type': getCanonicalVideoMimeType(extension), 'x-upsert': 'false' }, body: file,
        })
        if (!response.ok || cancelled) throw new Error('Upload failed')
        phase = 'finalize'
        uploadController = null
        onState('finalizing')
        // Let finalization finish even if the card unmounts; do not claim success
        // until the backend confirms ready. Failed/ambiguous responses can safely
        // attempt cancellation because that endpoint cannot delete ready videos.
        const finalized = await post('finalize', { videoId }, false, identifier)
        if (finalized.status !== 'ready' || finalized.videoId !== videoId) {
          throw new Error('Finalization not confirmed')
        }
        onState('success')
      } catch {
        if (videoId) {
          try { await post('cancel', { videoId }, true, identifier) } catch {
            // Best effort; initiation's stale cleanup remains the fallback.
          }
        }
        onState('error', cancelled && phase !== 'finalize' ? 'cancelled' : phase)
      } finally {
        busy = false
        uploadController = null
      }
    },
  }
}
