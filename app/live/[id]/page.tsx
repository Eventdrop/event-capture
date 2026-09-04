'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'

type LivePhoto = {
  id: string
  file_url: string
  created_at: string | null
}

type LiveResponse = {
  ok: boolean
  event?: {
    id: string
    name: string
  }
  photos?: LivePhoto[]
  error?: string
}

export default function LiveSlideshowPage() {
  const params = useParams<{ id: string }>()
  const eventId = params.id

  const [eventName, setEventName] = useState('EventDrop Live')
  const [photos, setPhotos] = useState<LivePhoto[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [status, setStatus] = useState('Foto’s laden…')

  const loadedOnceRef = useRef(false)
  const knownPhotoIdsRef = useRef<Set<string>>(new Set())

  const loadPhotos = useCallback(async () => {
    if (!eventId) return

    try {
      const response = await fetch(`/api/live/${encodeURIComponent(eventId)}`, {
        cache: 'no-store',
      })

      const result = (await response.json()) as LiveResponse

      if (!response.ok || !result.ok || !result.event) {
        setStatus(result.error || 'Live slideshow kon niet worden geladen.')
        return
      }

      const nextPhotos = result.photos || []
      setEventName(result.event.name)

      if (loadedOnceRef.current) {
        const newPhotoIndexes = nextPhotos
          .map((photo, index) =>
            knownPhotoIdsRef.current.has(photo.id) ? -1 : index
          )
          .filter((index) => index >= 0)

        if (newPhotoIndexes.length > 0) {
          setCurrentIndex(newPhotoIndexes[newPhotoIndexes.length - 1])
        }
      }

      knownPhotoIdsRef.current = new Set(nextPhotos.map((photo) => photo.id))
      loadedOnceRef.current = true

      setPhotos(nextPhotos)
      setStatus(
        nextPhotos.length === 0
          ? 'Nog geen foto’s. Nieuwe uploads verschijnen automatisch.'
          : ''
      )
    } catch (error) {
      console.error('Live slideshow refresh failed', error)
      setStatus('Live slideshow kon niet worden vernieuwd.')
    }
  }, [eventId])

  useEffect(() => {
    void loadPhotos()

    const refreshTimer = window.setInterval(() => {
      void loadPhotos()
    }, 5000)

    return () => window.clearInterval(refreshTimer)
  }, [loadPhotos])

  useEffect(() => {
    if (photos.length <= 1) return

    const slideshowTimer = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % photos.length)
    }, 8000)

    return () => window.clearInterval(slideshowTimer)
  }, [photos.length])

  useEffect(() => {
    if (photos.length === 0) {
      setCurrentIndex(0)
      return
    }

    if (currentIndex >= photos.length) {
      setCurrentIndex(0)
    }
  }, [currentIndex, photos.length])

  const currentPhoto = photos[currentIndex] || null

  const openFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Fullscreen failed', error)
    }
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black text-white">
      {currentPhoto ? (
        <img
          key={currentPhoto.id}
          src={currentPhoto.file_url}
          alt=""
          className="h-screen w-screen object-contain"
        />
      ) : (
        <div className="px-8 text-center">
          <p className="text-2xl font-semibold">{eventName}</p>
          <p className="mt-3 text-sm text-white/65">{status}</p>
        </div>
      )}

      <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/70 to-transparent px-6 py-5">
        <div>
          <p className="text-lg font-semibold tracking-tight">{eventName}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/60">
            EventDrop Live
          </p>
        </div>

        {photos.length > 0 ? (
          <p className="text-sm font-medium text-white/65">
            {currentIndex + 1} / {photos.length}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={openFullscreen}
        className="absolute bottom-5 right-5 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black/75"
      >
        Fullscreen
      </button>
    </main>
  )
}
