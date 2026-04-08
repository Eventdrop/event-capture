export type MediaKind = 'photo' | 'video'

export type UploadRecord = {
  id: string
  event_id?: string | null
  file_url: string
  file_name?: string | null
  storage_path?: string | null
  media_type?: string | null
  type?: string | null
  mime_type?: string | null
  created_at?: string | null
  expires_at?: string | null
}

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'])
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'm4v', 'webm', 'quicktime'])

export function padDatePart(value: number) {
  return value.toString().padStart(2, '0')
}

export function formatAlbumDate(date: Date) {
  const day = padDatePart(date.getDate())
  const month = padDatePart(date.getMonth() + 1)
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

export function formatTimestampSlug(date: Date) {
  const hour = padDatePart(date.getHours())
  const minute = padDatePart(date.getMinutes())
  const second = padDatePart(date.getSeconds())

  return `${formatAlbumDate(date)}-${hour}-${minute}-${second}`
}

export function getRandomToken() {
  return Math.random().toString(36).slice(2, 8)
}

export function getFileExtension(file: File) {
  const originalName = file.name || ''
  const extFromName = originalName.includes('.')
    ? originalName.split('.').pop()?.toLowerCase()
    : ''

  if (extFromName) return extFromName

  if (file.type.includes('jpeg')) return 'jpg'
  if (file.type.includes('png')) return 'png'
  if (file.type.includes('webp')) return 'webp'
  if (file.type.includes('heic')) return 'heic'
  if (file.type.includes('heif')) return 'heif'
  if (file.type.includes('mp4')) return 'mp4'
  if (file.type.includes('webm')) return 'webm'
  if (file.type.includes('quicktime')) return 'mov'

  return 'bin'
}

export function getMediaKind(file: File): MediaKind | null {
  if (file.type.startsWith('image/')) return 'photo'
  if (file.type.startsWith('video/')) return 'video'

  const extension = getFileExtension(file)

  if (IMAGE_EXTENSIONS.has(extension)) return 'photo'
  if (VIDEO_EXTENSIONS.has(extension)) return 'video'

  return null
}

export function buildStoragePath(file: File, now = new Date()) {
  const extension = getFileExtension(file)
  const albumFolder = formatAlbumDate(now)
  const fileName = `${formatTimestampSlug(now)}-${getRandomToken()}.${extension}`

  return {
    albumFolder,
    fileName,
    storagePath: `${albumFolder}/${fileName}`,
    extension,
  }
}

export function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

export function isExpired(expiresAt?: string | null) {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() <= Date.now()
}

export function inferMediaKind(upload: UploadRecord): MediaKind {
  const explicitType = upload.media_type || upload.type || ''

  if (explicitType === 'video') return 'video'
  if (explicitType === 'photo') return 'photo'

  const mimeType = upload.mime_type || ''
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('image/')) return 'photo'

  const target = `${upload.file_name || ''} ${upload.file_url}`.toLowerCase()
  if (target.match(/\.(mp4|mov|m4v|webm)(\?|$)/)) return 'video'

  return 'photo'
}

export function getDownloadFileName(upload: UploadRecord) {
  return (
    upload.file_name ||
    upload.storage_path?.split('/').pop() ||
    `eventdrop-${upload.id}`
  )
}

export function slugifyShareValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatUploadSequence(value: number) {
  return value.toString().padStart(3, '0')
}

export function parseOrdinalShareKey(value: string) {
  const match = value.match(/^(.*)-(\d{3})$/)

  if (!match) return null

  const eventSlug = match[1]?.trim() || ''
  const sequence = Number(match[2])

  if (!eventSlug || !Number.isFinite(sequence) || sequence < 1) {
    return null
  }

  return {
    eventSlug,
    sequence,
  }
}

export function getUploadShareKey(
  upload: UploadRecord,
  options?: { eventSlug?: string; sequence?: number }
) {
  const slug = slugifyShareValue(options?.eventSlug || '')
  const sequence = options?.sequence || 0

  if (slug && sequence > 0) {
    return `${slug}-${formatUploadSequence(sequence)}`
  }

  const fileName = upload.file_name || upload.storage_path?.split('/').pop() || ''

  if (fileName.includes('.')) {
    return fileName.replace(/\.[^.]+$/, '')
  }

  return upload.id
}

export function getPublicFileUrl(baseUrl: string, bucket: string, storagePath: string) {
  const trimmedBase = baseUrl.replace(/\/$/, '')
  return `${trimmedBase}/storage/v1/object/public/${bucket}/${storagePath}`
}

export function getStoragePathFromUpload(upload: UploadRecord) {
  if (upload.storage_path) return upload.storage_path

  const marker = '/storage/v1/object/public/event-uploads/'
  const index = upload.file_url.indexOf(marker)

  if (index === -1) return null

  return upload.file_url.slice(index + marker.length)
}

export function getUploadFileExtension(upload: UploadRecord) {
  const fileName = getDownloadFileName(upload)
  const match = fileName.match(/\.([a-z0-9]+)$/i)
  return match?.[1]?.toLowerCase() || 'jpg'
}

export function getUploadShortFileName(
  upload: UploadRecord,
  options?: { eventSlug?: string; sequence?: number }
) {
  const shareKey = getUploadShareKey(upload, options)
  const extension = getUploadFileExtension(upload)
  return `${shareKey}.${extension}`
}
