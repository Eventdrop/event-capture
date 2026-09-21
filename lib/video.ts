export type VideoType = 'video_message' | 'event_video'
export type VideoUploadExtension = 'mp4' | 'webm' | 'mov'

const videoUploadMimeTypes: Record<VideoUploadExtension, readonly string[]> = {
  mp4: ['video/mp4'],
  webm: ['video/webm'],
  mov: ['video/quicktime', 'video/x-quicktime', 'video/mov'],
}

export function isSupportedVideoExtension(value: unknown): value is VideoUploadExtension {
  return value === 'mp4' || value === 'webm' || value === 'mov'
}

export function getCanonicalVideoMimeType(extension: VideoUploadExtension) {
  return videoUploadMimeTypes[extension][0]
}

export function isSupportedVideoMimeType(extension: VideoUploadExtension, mimeType: string) {
  return videoUploadMimeTypes[extension].includes(mimeType)
}

export function getVideoStorageExtension(storagePath: string | null, prefix: string) {
  if (!storagePath) return null

  return (['mp4', 'webm', 'mov'] as const).find(
    (extension) => storagePath === `${prefix}.${extension}`
  ) || null
}

export type VideoStatus =
  | 'pending_upload'
  | 'uploaded'
  | 'ready'
  | 'failed'
  | 'hidden'

export interface EventVideo {
  id: string
  eventId: string
  type: VideoType
  storagePath: string | null
  status: VideoStatus
  mimeType: string | null
  sizeBytes: number | null
  durationMs: number | null
  width: number | null
  height: number | null
  guestName: string | null
  uploaderSessionId: string | null
  createdAt: string
  updatedAt: string
}

export type VideoPolicy =
  | {
      readonly enabled: true
      readonly maxDurationMs: number
      readonly maxSizeBytes: number
    }
  | {
      readonly enabled: false
      readonly maxDurationMs: null
      readonly maxSizeBytes: null
    }

export const videoPolicies = {
  video_message: {
    enabled: true,
    maxDurationMs: 15000,
    maxSizeBytes: 25 * 1024 * 1024,
  },
  event_video: {
    enabled: false,
    maxDurationMs: null,
    maxSizeBytes: null,
  },
} as const satisfies Record<VideoType, VideoPolicy>

export function getVideoPolicy(type: VideoType): VideoPolicy {
  return videoPolicies[type]
}

export function isSupportedVideoType(value: unknown): value is VideoType {
  return value === 'video_message' || value === 'event_video'
}

export function isEnabledVideoType(value: unknown): value is VideoType {
  return isSupportedVideoType(value) && getVideoPolicy(value).enabled
}
