'use client'

import { useState } from 'react'
import { shareMedia } from '@/lib/share-media'

type Props = {
  fileName: string
  fileUrl: string
  label?: string
  shareUrl?: string
  title?: string
}

export function MediaShareButton({
  fileName,
  fileUrl,
  label = 'Delen',
  shareUrl,
  title = 'Photobooth Holland',
}: Props) {
  const [sharing, setSharing] = useState(false)

  const handleShare = async () => {
    if (sharing) return

    const fallbackUrl = shareUrl || fileUrl
    setSharing(true)

    try {
      const result = await shareMedia({
        fileName,
        fileUrl,
        shareUrl: fallbackUrl,
        title,
      })

      if (result === 'copied') {
        window.alert('De link is naar het klembord gekopieerd.')
      }
    } catch (error) {
      console.error('Media share failed', error)

      try {
        await navigator.clipboard.writeText(fallbackUrl)
        window.alert('De link is naar het klembord gekopieerd.')
      } catch {
        window.alert('Delen kon op dit moment niet worden geopend.')
      }
    } finally {
      setSharing(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={sharing}
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold ${
        sharing
          ? 'cursor-not-allowed bg-stone-300 text-stone-500'
          : 'bg-[#0F3D66] text-white hover:bg-[#0B2F4F]'
      }`}
    >
      {sharing ? 'Delen wordt geopend...' : label}
    </button>
  )
}
