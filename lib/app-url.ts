export function getPublicAppUrl() {
  return 'https://upload.photoboothholland.com'
}

export function getPublicPath(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return new URL(normalizedPath, getPublicAppUrl()).toString()
}

export function getPublicMediaUrl(shareKey: string) {
  return getPublicPath(`/media/${shareKey}`)
}
