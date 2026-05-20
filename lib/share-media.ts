export type MediaShareInput = {
  fileName: string
  fileUrl: string
  shareUrl: string
  title: string
}

export async function shareMedia(input: MediaShareInput) {
  if (navigator.share) {
    const file = await buildShareFile(input.fileUrl, input.fileName)

    if (file && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: input.title,
        text: input.fileName,
        files: [file],
      })
      return 'shared' as const
    }

    await navigator.share({
      title: input.title,
      text: input.fileName,
      url: input.shareUrl,
    })
    return 'shared' as const
  }

  await navigator.clipboard.writeText(input.shareUrl)
  return 'copied' as const
}

async function buildShareFile(fileUrl: string, fileName: string) {
  try {
    const response = await fetch(fileUrl)

    if (!response.ok) return null

    const blob = await response.blob()
    const type = blob.type || getMimeTypeFromFileName(fileName)

    return new File([blob], fileName, { type })
  } catch {
    return null
  }
}

function getMimeTypeFromFileName(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase()

  if (extension === 'png') return 'image/png'
  if (extension === 'webp') return 'image/webp'
  if (extension === 'heic') return 'image/heic'
  if (extension === 'heif') return 'image/heif'

  return 'image/jpeg'
}
