'use client'

import { useState } from 'react'

type Props = {
  fileName: string
  fileUrl: string
}

export function MediaDownloadButton({ fileName, fileUrl }: Props) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (downloading) return

    setDownloading(true)

    try {
      const response = await fetch(fileUrl)

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}.`)
      }

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')

      anchor.href = blobUrl
      anchor.download = fileName
      anchor.click()

      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Media download failed', error)
      window.alert('De download kon nu niet worden gestart.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold ${
        downloading
          ? 'cursor-not-allowed bg-stone-300 text-stone-500'
          : 'bg-[#F58220] text-white hover:bg-[#DB6E12]'
      }`}
    >
      {downloading ? 'Download wordt gestart...' : 'Download'}
    </button>
  )
}
