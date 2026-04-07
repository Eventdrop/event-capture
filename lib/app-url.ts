export function getPublicAppUrl() {
  return 'https://upload.photoboothholland.com'
}

export function getPublicMediaUrl(shareKey: string) {
  return `${getPublicAppUrl()}/media/${shareKey}`
}
