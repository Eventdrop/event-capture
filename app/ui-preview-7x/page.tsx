'use client'

import { useState } from 'react'

type SectionKey = 'photos' | 'guestbook' | 'designs' | 'downloads'
type PreviewMode = 'album' | 'access'
type ModalKey = 'upload-info' | 'email-info' | null

const navigation: { key: SectionKey; label: string }[] = [
  { key: 'photos', label: 'Foto’s' },
  { key: 'guestbook', label: 'Gastenboek' },
  { key: 'designs', label: 'Ontwerpen' },
  { key: 'downloads', label: 'Downloaden' },
]

const photoCards = [
  { src: '/home-tile-1.png', ratio: 'aspect-[4/5]' },
  { src: '/home-strip-fun.jpg', ratio: 'aspect-[5/4]' },
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
  const [previewMode, setPreviewMode] = useState<PreviewMode>('album')
  const [activeSection, setActiveSection] = useState<SectionKey>('photos')
  const [modal, setModal] = useState<ModalKey>(null)
  const [uploadConsent, setUploadConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)

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
                Ik wil af en toe nieuws, updates en aanbiedingen van Photobooth Holland / EventDrop ontvangen.
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
            <section className="relative h-[210px] overflow-hidden rounded-2xl sm:h-[300px]">
              <img
                src="/home-hero-fun.jpg"
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/58 via-black/22 to-transparent px-4 pb-4 pt-16 sm:px-6 sm:pb-6">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/82">
                  EVENTDROP
                </p>
                <h1 className="mt-1 text-[2rem] font-black leading-none tracking-[-0.03em] text-white sm:text-5xl">
                  Monique 70 jaar
                </h1>
                <p className="mt-2 text-sm font-semibold text-white/82 sm:text-base">
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
                      <label className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#d71920] px-4 py-2.5 text-sm font-black text-white">
                        Bestanden kiezen
                        <input type="file" multiple accept="image/*" className="sr-only" />
                      </label>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <label className="flex items-start gap-2 text-xs leading-5 text-neutral-600 sm:text-sm">
                        <input
                          type="checkbox"
                          checked={uploadConsent}
                          onChange={(event) => setUploadConsent(event.target.checked)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-neutral-300 accent-[#d71920] sm:h-4 sm:w-4"
                        />
                        <span>Ik bevestig dat ik deze foto’s mag uploaden.</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setModal('upload-info')}
                        className="text-xs font-bold text-[#b51218] underline decoration-[#f0b4b8] underline-offset-4 sm:text-sm"
                      >
                        Meer informatie
                      </button>
                    </div>
                  </div>

                  <div className="columns-2 gap-1.5 sm:columns-3">
                    {photoCards.map((photo) => (
                      <img
                        key={photo.src}
                        src={photo.src}
                        alt=""
                        className={`${photo.ratio} mb-1.5 w-full break-inside-avoid rounded-[10px] object-cover`}
                      />
                    ))}
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
              onClick={() => setModal(null)}
              className="mt-5 w-full rounded-xl bg-[#d71920] px-4 py-3 text-sm font-black text-white"
            >
              {modal === 'upload-info' ? 'Begrepen' : 'Sluiten'}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  )
}
