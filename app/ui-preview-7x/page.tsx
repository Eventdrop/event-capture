'use client'

import { useEffect, useRef, useState } from 'react'

type SectionKey = 'photos' | 'guestbook' | 'designs' | 'downloads'
type PreviewMode = 'album' | 'access'
type ModalKey = 'upload-info' | 'email-info' | null
type PreviewPhoto = {
  src: string
  ratio: string
  name?: string
}

const GUEST_MESSAGE_MAX_LENGTH = 500
const UPLOAD_CONSENT_STORAGE_KEY = 'eventdrop-ui-preview-upload-consent'

const navigation: { key: SectionKey; label: string }[] = [
  { key: 'photos', label: 'Foto’s' },
  { key: 'guestbook', label: 'Gastenboek' },
  { key: 'designs', label: 'Ontwerpen' },
  { key: 'downloads', label: 'Downloaden' },
]

const photoCards: PreviewPhoto[] = [
  { src: '/home-tile-1.png', ratio: 'aspect-[4/5]' },
  { src: '/home-tile-2.png', ratio: 'aspect-[3/4]' },
  { src: '/home-poster-reference.jpg', ratio: 'aspect-[4/5]' },
  { src: '/home-hero-custom.png', ratio: 'aspect-[6/5]' },
  { src: '/home-tile-3.png', ratio: 'aspect-[3/4]' },
  { src: '/home-hero-fun.jpg', ratio: 'aspect-[5/4]' },
]

const messages = [
  {
    name: 'Sanne',
    text: 'Wat een prachtige avond. De sfeer, de muziek en alle lieve mensen pasten helemaal bij Monique.',
    time: '20:14',
    hasPhoto: true,
  },
  {
    name: 'Peter en Linda',
    text: 'Gefeliciteerd met je 70e verjaardag. We hebben genoten van ieder moment.',
    time: '20:38',
    hasPhoto: false,
  },
  {
    name: 'Eva',
    text: 'Een heel warme herinnering aan een bijzondere dag. Dank je wel dat we erbij mochten zijn.',
    time: '21:02',
    hasPhoto: true,
  },
]

const designCards = [
  {
    title: 'Memory Poster A3',
    description: 'Een printklare collage met de mooiste foto’s van de dag.',
    shape: 'aspect-[3/4]',
  },
  {
    title: 'Instagram Story',
    description: 'Een verticale herinnering om direct te delen.',
    shape: 'aspect-[9/16]',
  },
]

function NavIcon({ icon }: { icon: SectionKey }) {
  if (icon === 'photos') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
        <path d="M4 8.5h3.3l1.4-2h6.6l1.4 2H20v9H4v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    )
  }

  if (icon === 'guestbook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
        <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H19v13.5H7.5A2.5 2.5 0 0 0 5 20V6.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 9.5c1.2-1.7 4.8-1.7 6 0 1 1.5-.4 3.1-3 4.7-2.6-1.6-4-3.2-3-4.7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    )
  }

  if (icon === 'designs') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
        <path d="M5 5h6v6H5V5Zm8 2h6m-6 4h6M5 15h14v4H5v-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="m17.5 3 .5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5.5-1.2Z" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
      <path d="M12 4v10m0 0 4-4m-4 4-4-4M5 18.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function UiPreview7xPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const objectUrlsRef = useRef<string[]>([])
  const [previewMode, setPreviewMode] = useState<PreviewMode>('album')
  const [activeSection, setActiveSection] = useState<SectionKey>('photos')
  const [modal, setModal] = useState<ModalKey>(null)
  const [uploadConsent, setUploadConsent] = useState(false)
  const [hasUploadConsent, setHasUploadConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([photoCards[0].src])
  const [visiblePhotos, setVisiblePhotos] = useState(photoCards)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)
  const [photoToDelete, setPhotoToDelete] = useState<PreviewPhoto | null>(null)
  const [photoFeedback, setPhotoFeedback] = useState('')
  const [pendingPhotos, setPendingPhotos] = useState<PreviewPhoto[]>([])
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false)
  const [guestbookPhotoSrc, setGuestbookPhotoSrc] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestMessage, setGuestMessage] = useState('')
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  useEffect(() => {
    setHasUploadConsent(sessionStorage.getItem(UPLOAD_CONSENT_STORAGE_KEY) === 'true')
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const chooseFiles = () => {
    if (!hasUploadConsent) {
      setUploadConsent(false)
      setModal('upload-info')
      return
    }

    fileInputRef.current?.click()
  }

  const acceptUploadConsent = () => {
    if (!uploadConsent) return

    sessionStorage.setItem(UPLOAD_CONSENT_STORAGE_KEY, 'true')
    setHasUploadConsent(true)
    setModal(null)
    fileInputRef.current?.click()
  }

  const showPhotoFeedback = (message: string) => {
    setPhotoFeedback(message)
    window.setTimeout(() => setPhotoFeedback(''), 1600)
  }

  const previewIndex = previewPhoto
    ? visiblePhotos.findIndex((photo) => photo.src === previewPhoto)
    : -1
  const previousPreviewPhoto =
    previewIndex > 0 ? visiblePhotos[previewIndex - 1] : null
  const nextPreviewPhoto =
    previewIndex >= 0 && previewIndex < visiblePhotos.length - 1
      ? visiblePhotos[previewIndex + 1]
      : null

  const confirmPhotoDelete = () => {
    if (!photoToDelete) return

    if (photoToDelete.src.startsWith('blob:')) {
      URL.revokeObjectURL(photoToDelete.src)
      objectUrlsRef.current = objectUrlsRef.current.filter(
        (url) => url !== photoToDelete.src
      )
    }
    setVisiblePhotos((current) =>
      current.filter((item) => item.src !== photoToDelete.src)
    )
    setSelectedPhotos((current) =>
      current.filter((item) => item !== photoToDelete.src)
    )
    if (previewPhoto === photoToDelete.src) setPreviewPhoto(null)
    setPhotoToDelete(null)
    showPhotoFeedback('Foto verwijderd')
  }

  useEffect(() => {
    if (!previewPhoto) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewPhoto(null)
      } else if (event.key === 'ArrowLeft' && previousPreviewPhoto) {
        setPreviewPhoto(previousPreviewPhoto.src)
      } else if (event.key === 'ArrowRight' && nextPreviewPhoto) {
        setPreviewPhoto(nextPreviewPhoto.src)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextPreviewPhoto, previewPhoto, previousPreviewPhoto])

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith('image/')
    )

    pendingPhotos.forEach((photo) => URL.revokeObjectURL(photo.src))
    const nextPhotos = files.map((file) => {
      const src = URL.createObjectURL(file)
      objectUrlsRef.current.push(src)

      return {
        src,
        ratio: 'aspect-[4/5]',
        name: file.name,
      }
    })

    setPendingPhotos(nextPhotos)
    setGuestbookPhotoSrc('')
    setUploadSheetOpen(nextPhotos.length > 0)
  }

  const uploadPendingPhotos = () => {
    if (pendingPhotos.length === 0) return

    setVisiblePhotos((current) => [...pendingPhotos, ...current])
    setPendingPhotos([])
    setGuestbookPhotoSrc('')
    setUploadSheetOpen(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    showPhotoFeedback('Foto’s toegevoegd')
  }

  const removePendingPhoto = (photo: PreviewPhoto) => {
    if (photo.src.startsWith('blob:')) {
      URL.revokeObjectURL(photo.src)
      objectUrlsRef.current = objectUrlsRef.current.filter((url) => url !== photo.src)
    }

    setPendingPhotos((current) => current.filter((item) => item.src !== photo.src))
    if (guestbookPhotoSrc === photo.src) setGuestbookPhotoSrc('')
  }

  const sharePhoto = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    try {
      const shareData = {
        title: 'Monique 70 jaar',
        text: 'Bekijk het EventDrop Sharing album van Monique 70 jaar.',
        url: window.location.href,
      }

      if (navigator.share) {
        await navigator.share(shareData)
        showPhotoFeedback('Gedeeld')
        return
      }

      await navigator.clipboard.writeText(window.location.href)
      showPhotoFeedback('Link gekopieerd')
    } catch {
      showPhotoFeedback('Delen mislukt')
    }
  }

  const downloadPhoto = async (
    event: React.MouseEvent<HTMLButtonElement>,
    photo: PreviewPhoto
  ) => {
    event.stopPropagation()

    try {
      const response = await fetch(photo.src)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      const fallbackExtension = blob.type.includes('png') ? 'png' : 'jpg'
      const fileName =
        photo.name ||
        photo.src.split('/').pop()?.split('?')[0] ||
        `eventdrop-foto.${fallbackExtension}`

      anchor.href = objectUrl
      anchor.download = fileName.includes('.') ? fileName : `${fileName}.${fallbackExtension}`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
      showPhotoFeedback('Download gestart')
    } catch {
      showPhotoFeedback('Download mislukt')
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#191817]">
      <div className="mx-auto w-full max-w-[900px] px-2.5 py-2 sm:px-5 sm:py-5">
        <button
          type="button"
          onClick={() => setPreviewMode(previewMode === 'album' ? 'access' : 'album')}
          className="ml-auto mb-2 block text-xs font-semibold text-neutral-400 underline underline-offset-4 hover:text-[#d71920]"
        >
          {previewMode === 'album' ? 'Bekijk toegangsscherm' : 'Bekijk album'}
        </button>

        {previewMode === 'access' ? (
          <section className="mt-4 rounded-[1.5rem] border border-neutral-200 bg-white p-4 shadow-[0_14px_40px_rgba(20,20,20,0.07)] sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d71920]">
              Toegang
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-neutral-950">
              Bekijk en deel foto’s van het event
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600">
              Vul je e-mailadres in om toegang te krijgen tot het album van Monique 70 jaar.
            </p>

            <label className="mt-5 block text-xs font-black uppercase tracking-[0.08em] text-neutral-500">
              E-mailadres
              <input
                type="email"
                placeholder="naam@example.com"
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-base font-semibold text-neutral-950 outline-none transition focus:border-[#d71920] focus:bg-white"
              />
            </label>

            <button
              type="button"
              onClick={() => setModal('email-info')}
              className="mt-2 text-left text-sm font-bold text-[#b51218] underline decoration-[#f0b4b8] underline-offset-4"
            >
              Waarom vragen we dit?
            </button>

            <label className="mt-4 flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-600">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(event) => setMarketingConsent(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-300 accent-[#d71920]"
              />
              <span>
                Ik wil af en toe nieuws, updates en aanbiedingen van Photobooth Holland / EventDrop Sharing ontvangen.
              </span>
            </label>

            <button
              type="button"
              className="mt-5 w-full rounded-2xl bg-[#d71920] px-5 py-4 text-base font-black text-white shadow-[0_12px_26px_rgba(215,25,32,0.2)]"
            >
              Verder
            </button>
          </section>
        ) : (
          <>
            <section>
              <div className="relative h-[195px] overflow-hidden rounded-[13px] sm:h-[290px]">
                <img
                  src="/home-hero-custom.png"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="px-1 pt-2">
                <img
                  src="/eventdrop-logo.svg"
                  alt="EventDrop Sharing"
                  className="h-5 w-auto"
                />
                <h1 className="mt-0.5 text-[1.65rem] font-black leading-tight tracking-[-0.03em] text-neutral-950 sm:text-3xl">
                  Monique 70 jaar
                </h1>
                <p className="mt-0.5 text-sm font-semibold text-neutral-500 sm:text-base">
                  31 augustus 2026 · 39 foto’s
                </p>
              </div>
            </section>

            <nav className="mt-3 border-b border-neutral-200">
              <div className="grid grid-cols-4 gap-1">
                {navigation.map((item) => {
                  const isActive = activeSection === item.key

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveSection(item.key)}
                      className={`relative flex flex-col items-center gap-1 px-1 pb-2.5 pt-2 text-[11px] font-black transition sm:text-sm ${
                        isActive
                          ? 'text-[#d71920]'
                          : 'text-neutral-500 hover:text-neutral-950'
                      }`}
                    >
                      <NavIcon icon={item.key} />
                      <span>{item.label}</span>
                      {isActive ? (
                        <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#d71920]" />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </nav>

            <div className="py-3 sm:py-5">
              {activeSection === 'photos' ? (
                <section className="space-y-3">
                  <div className="border-b border-neutral-200 bg-white px-1 pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-black tracking-[-0.02em] text-neutral-950 sm:text-lg">
                          Foto’s toevoegen
                        </h2>
                        <p className="mt-0.5 text-sm leading-5 text-neutral-500">
                          Deel jouw foto's met het album
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={chooseFiles}
                        className="inline-flex min-h-8 shrink-0 items-center justify-center rounded-lg bg-[#d71920] px-2.5 py-1.5 text-[11px] font-black text-white sm:min-h-9 sm:px-3 sm:text-xs"
                      >
                        Bestanden kiezen
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelection}
                        className="sr-only"
                      />
                    </div>

                  </div>

                  {photoFeedback ? (
                    <p className="rounded-full bg-neutral-950 px-3 py-1.5 text-center text-xs font-bold text-white">
                      {photoFeedback}
                    </p>
                  ) : null}

                  <div className="grid grid-cols-3 gap-1.5 min-[500px]:grid-cols-4 sm:gap-2 lg:grid-cols-5 xl:grid-cols-6">
                    {visiblePhotos.map((photo) => {
                      const isSelected = selectedPhotos.includes(photo.src)

                      return (
                        <article
                          key={photo.src}
                          className={`overflow-hidden rounded-xl bg-neutral-100 ${
                            isSelected ? 'ring-2 ring-[#d71920]/75 ring-offset-2' : ''
                          }`}
                        >
                          <div className="relative">
                            <img
                              src={photo.src}
                              alt=""
                              className="aspect-[4/5] w-full bg-neutral-100 object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => setPreviewPhoto(photo.src)}
                              aria-label="Voorbeeld openen"
                              title="Voorbeeld openen"
                              className="absolute inset-0 z-10"
                            />

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedPhotos((current) =>
                                  current.includes(photo.src)
                                    ? current.filter((item) => item !== photo.src)
                                    : [...current, photo.src]
                                )
                              }}
                              aria-label={isSelected ? 'Geselecteerd' : 'Selecteren'}
                              title={isSelected ? 'Geselecteerd' : 'Selecteren'}
                              className={`absolute left-1.5 top-1.5 z-20 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/75 shadow-sm backdrop-blur sm:h-7 sm:w-7 ${
                                isSelected
                                  ? 'bg-[#d71920] text-white'
                                  : 'bg-white/90 text-neutral-700'
                              }`}
                            >
                              {isSelected ? (
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.8]">
                                  <path d="M5 12.5 9.5 17 19 7.5" />
                                </svg>
                              ) : (
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                                  <circle cx="12" cy="12" r="8" />
                                </svg>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setPhotoToDelete(photo)
                              }}
                              aria-label="Verwijderen"
                              title="Verwijderen"
                              className="absolute right-1.5 top-1.5 z-20 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/75 bg-[#d71920]/92 text-white shadow-sm backdrop-blur sm:h-7 sm:w-7"
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                                <path d="M4 7h16" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M6 7l1 12h10l1-12" />
                                <path d="M9 7V4h6v3" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={sharePhoto}
                              aria-label="Delen"
                              title="Delen"
                              className="absolute bottom-1.5 left-1.5 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/75 bg-white/92 text-neutral-800 shadow-[0_4px_14px_rgba(0,0,0,0.16)] backdrop-blur"
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[2.2]">
                                <path d="M12 5v10" />
                                <path d="m8 9 4-4 4 4" />
                                <path d="M5 19h14" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={(event) => downloadPhoto(event, photo)}
                              aria-label="Downloaden"
                              title="Downloaden"
                              className="absolute bottom-1.5 right-1.5 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#d71920]/75 bg-[#d71920]/94 text-white shadow-[0_4px_14px_rgba(215,25,32,0.24)] backdrop-blur"
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[2.2]">
                                <path d="M12 4v10" />
                                <path d="m8 10 4 4 4-4" />
                                <path d="M5 19h14" />
                              </svg>
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              ) : null}

              {activeSection === 'guestbook' ? (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-[-0.03em] text-neutral-950">
                      Gastenboek
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">
                      Persoonlijke berichten van gasten, samen met hun mooiste foto’s.
                    </p>
                  </div>
                  {messages.map((message) => (
                    <article
                      key={`${message.name}-${message.time}`}
                      className="rounded-[1.35rem] border border-neutral-200 bg-white p-4 shadow-[0_10px_28px_rgba(20,20,20,0.06)]"
                    >
                      <div className="flex gap-3">
                        {message.hasPhoto ? (
                          <div className="h-20 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-red-100 via-white to-neutral-200" />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-black text-neutral-950">{message.name}</p>
                            <p className="text-xs font-bold text-neutral-400">{message.time}</p>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-neutral-700">
                            {message.text}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </section>
              ) : null}

              {activeSection === 'designs' ? (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-[-0.03em] text-neutral-950">
                      Ontwerpen
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">
                      Maak van het album een printbaar of deelbaar ontwerp.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {designCards.map((design) => (
                      <article
                        key={design.title}
                        className="rounded-[1.35rem] border border-neutral-200 bg-white p-4 shadow-[0_10px_28px_rgba(20,20,20,0.06)]"
                      >
                        <div
                          className={`${design.shape} mx-auto w-full max-w-[260px] rounded-[1.2rem] bg-[linear-gradient(145deg,#d71920_0%,#ffffff_48%,#efefef_100%)] p-3`}
                        >
                          <div className="grid h-full grid-cols-2 gap-2">
                            <div className="rounded-xl bg-white/70" />
                            <div className="rounded-xl bg-neutral-200/70" />
                            <div className="rounded-xl bg-neutral-100/80" />
                            <div className="rounded-xl bg-white/80" />
                          </div>
                        </div>
                        <h3 className="mt-4 text-lg font-black text-neutral-950">
                          {design.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-neutral-600">
                          {design.description}
                        </p>
                        <button
                          type="button"
                          className="mt-4 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-black text-neutral-950"
                        >
                          Voorbeeld bekijken
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {activeSection === 'downloads' ? (
                <section className="space-y-4">
                  <div className="rounded-[1.35rem] border border-neutral-200 bg-white p-5 shadow-[0_10px_28px_rgba(20,20,20,0.06)]">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#d71920]">
                      Downloaden
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-neutral-950">
                      Bewaar het complete album
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      Download losse favorieten of alle foto’s in één pakket.
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        className="rounded-2xl bg-[#d71920] px-4 py-4 text-sm font-black text-white shadow-[0_10px_22px_rgba(215,25,32,0.16)]"
                      >
                        Compleet album
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-sm font-black text-neutral-950"
                      >
                        Selectie downloaden
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {['39 foto’s', '3 ontwerpen', '12 berichten'].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl bg-neutral-100 px-3 py-4 text-center text-sm font-black text-neutral-700"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </>
        )}
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/35 p-3 sm:items-center sm:justify-center">
          <div className="w-full max-w-[420px] rounded-3xl bg-white p-5 shadow-2xl">
            {modal === 'upload-info' ? (
              <>
                <h2 className="text-lg font-black text-neutral-950">Foto’s uploaden en delen</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-700">
                  Ik bevestig dat ik bevoegd ben om deze foto’s te uploaden en te delen, en dat foto’s die aan dit album worden toegevoegd door derden kunnen worden bekeken, gedownload en gedeeld.
                </p>
                <label className="mt-4 flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-700">
                  <input
                    type="checkbox"
                    checked={uploadConsent}
                    onChange={(event) => setUploadConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 accent-[#d71920]"
                  />
                  <span>Ik heb bovenstaande informatie gelezen en ga akkoord.</span>
                </label>
              </>
            ) : (
              <>
                <h2 className="text-lg font-black text-neutral-950">Waarom vragen we dit?</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-700">
                  Je e-mailadres helpt om toegang tot dit evenement te bevestigen en om je later veilig terug te brengen naar hetzelfde album.
                </p>
              </>
            )}
            <button
              type="button"
              onClick={modal === 'upload-info' ? acceptUploadConsent : () => setModal(null)}
              disabled={modal === 'upload-info' && !uploadConsent}
              className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-black text-white ${
                modal === 'upload-info' && !uploadConsent
                  ? 'cursor-not-allowed bg-neutral-300'
                  : 'bg-[#d71920]'
              }`}
            >
              {modal === 'upload-info' ? 'Akkoord en bestanden kiezen' : 'Sluiten'}
            </button>
          </div>
        </div>
      ) : null}

      {uploadSheetOpen && pendingPhotos.length > 0 ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/35 p-3 sm:items-center sm:justify-center">
          <div className="max-h-[88vh] w-full max-w-[520px] overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-neutral-950">
                  {pendingPhotos.length} foto&apos;s geselecteerd
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Controleer je selectie voordat je uploadt.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUploadSheetOpen(false)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg font-black text-neutral-700"
              >
                ×
              </button>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {pendingPhotos.map((photo) => (
                <div key={photo.src} className="relative">
                  <img
                    src={photo.src}
                    alt=""
                    className="aspect-[4/5] w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePendingPhoto(photo)}
                    aria-label="Foto verwijderen"
                    className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-950 text-xs font-black text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-neutral-50 p-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-black text-neutral-950">
                  Laat iets achter in het gastenboek
                </p>
                <p className="text-xs font-bold text-neutral-400">Optioneel</p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                <label className="block text-xs font-bold text-neutral-600">
                  Naam (optioneel)
                  <input
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    placeholder="Je naam"
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-950 outline-none focus:border-[#d71920]"
                  />
                </label>
                <label className="block text-xs font-bold text-neutral-600">
                  Bericht (optioneel)
                  <textarea
                    value={guestMessage}
                    onChange={(event) =>
                      setGuestMessage(event.target.value.slice(0, GUEST_MESSAGE_MAX_LENGTH))
                    }
                    maxLength={GUEST_MESSAGE_MAX_LENGTH}
                    placeholder="Bijv. Wat een prachtige dag! Veel geluk samen"
                    rows={3}
                    className="mt-1 w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-950 outline-none focus:border-[#d71920]"
                  />
                  <span className="mt-1 flex justify-between gap-2 text-[11px] font-semibold text-neutral-400">
                    <span>
                      {guestMessage.length === GUEST_MESSAGE_MAX_LENGTH
                        ? 'Maximum aantal tekens bereikt'
                        : 'Optioneel · Je bericht verschijnt in het gastenboek.'}
                    </span>
                    <span>{guestMessage.length} / {GUEST_MESSAGE_MAX_LENGTH}</span>
                  </span>
                </label>
              </div>

              {guestMessage.trim() ? (
                <div className="mt-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-black text-neutral-950">
                      Kies een foto voor het gastenboek
                    </p>
                    <p className="text-xs font-bold text-neutral-400">Optioneel</p>
                  </div>
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    <button
                      type="button"
                      onClick={() => setGuestbookPhotoSrc('')}
                      className={`h-16 w-16 shrink-0 rounded-xl border text-xs font-black ${
                        guestbookPhotoSrc
                          ? 'border-neutral-200 bg-white text-neutral-500'
                          : 'border-[#d71920] bg-[#fff1f1] text-[#d71920]'
                      }`}
                    >
                      Geen foto
                    </button>
                    {pendingPhotos.map((photo) => {
                      const isGuestbookPhoto = guestbookPhotoSrc === photo.src

                      return (
                        <button
                          key={photo.src}
                          type="button"
                          onClick={() => setGuestbookPhotoSrc(photo.src)}
                          className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${
                            isGuestbookPhoto ? 'border-[#d71920]' : 'border-transparent'
                          }`}
                        >
                          <img src={photo.src} alt="" className="h-full w-full object-cover" />
                          {isGuestbookPhoto ? (
                            <span className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#d71920] text-white">
                              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-[3]">
                                <path d="M5 12.5 9.5 17 19 7.5" />
                              </svg>
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={uploadPendingPhotos}
              className="mt-4 w-full rounded-xl bg-[#d71920] px-4 py-3 text-sm font-black text-white"
            >
              Uploaden
            </button>
          </div>
        </div>
      ) : null}

      {previewPhoto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-4"
          onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
          onTouchEnd={(event) => {
            if (touchStartX === null) return

            const deltaX = event.changedTouches[0]?.clientX - touchStartX
            if (deltaX < -45 && nextPreviewPhoto) {
              setPreviewPhoto(nextPreviewPhoto.src)
            } else if (deltaX > 45 && previousPreviewPhoto) {
              setPreviewPhoto(previousPreviewPhoto.src)
            }
            setTouchStartX(null)
          }}
        >
          <button
            type="button"
            aria-label="Sluiten"
            onClick={() => setPreviewPhoto(null)}
            className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-950"
          >
            ×
          </button>
          {previousPreviewPhoto ? (
            <button
              type="button"
              aria-label="Vorige foto"
              onClick={() => setPreviewPhoto(previousPreviewPhoto.src)}
              className="absolute left-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-950 shadow-lg backdrop-blur"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current stroke-2">
                <path d="m15 6-6 6 6 6" />
              </svg>
            </button>
          ) : null}
          {nextPreviewPhoto ? (
            <button
              type="button"
              aria-label="Volgende foto"
              onClick={() => setPreviewPhoto(nextPreviewPhoto.src)}
              className="absolute right-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-950 shadow-lg backdrop-blur"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current stroke-2">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          ) : null}
          <img
            src={previewPhoto}
            alt=""
            className="max-h-[82vh] max-w-full rounded-2xl object-contain"
          />
          <p className="absolute bottom-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-neutral-900">
            {previewIndex + 1} / {visiblePhotos.length}
          </p>
        </div>
      ) : null}

      {photoToDelete ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/35 p-3 sm:items-center sm:justify-center">
          <div className="w-full max-w-[360px] rounded-3xl bg-white p-5 shadow-2xl">
            <h2 className="text-lg font-black text-neutral-950">Foto verwijderen?</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              Weet je zeker dat je deze foto wilt verwijderen?
            </p>
            <img
              src={photoToDelete.src}
              alt=""
              className="mt-4 h-24 w-20 rounded-xl object-cover"
            />
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-black text-neutral-800"
              >
                Annuleren
              </button>
              <button
                type="button"
                onClick={confirmPhotoDelete}
                className="rounded-xl bg-[#d71920] px-4 py-3 text-sm font-black text-white"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
