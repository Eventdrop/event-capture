export function getPublicAppUrl() {
  return 'https://upload.photoboothholland.com'
}

export function getPublicMediaUrl(uploadId: string) {
  return `${getPublicAppUrl()}/media/${uploadId}`
}
