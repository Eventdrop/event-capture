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
  { title: 'Welkom', tone: 'from-neutral-200 via-white to-red-100', height: 'aspect-[4/5]' },
  { title: 'Proost', tone: 'from-red-100 via-white to-neutral-100', height: 'aspect-[4/5]' },
  { title: 'Familie', tone: 'from-stone-200 via-white to-red-50', height: 'aspect-[5/6]' },
  { title: 'Taartmoment', tone: 'from-white via-red-50 to-neutral-200', height: 'aspect-[5/6]' },
  { title: 'Dansvloer', tone: 'from-red-200 via-white to-stone-100', height: 'aspect-[4/5]' },
  { title: 'Vrienden', tone: 'from-neutral-100 via-white to-red-100', height: 'aspect-[4/5]' },
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

export default function UiPreview7xPage() {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('album')
  const [activeSection, setActiveSection] = useState<SectionKey>('photos')
  const [modal, setModal] = useState<ModalKey>(null)
  const [uploadConsent, setUploadConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)

  return (
    <main className="min-h-screen bg-white text-[#191817]">
      <div className="mx-auto w-full max-w-[780px] px-3 py-3 sm:px-5 sm:py-6">
        <header className="rounded-[1.35rem] border border-neutral-200 bg-white px-4 py-4 shadow-[0_12px_34px_rgba(20,20,20,0.06)] sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#d71920]">
                EventDrop
              </p>
              <h1 className="mt-1 text-3xl font-black leading-none tracking-[-0.03em] text-neutral-950 sm:text-4xl">
                Monique 70 jaar
              </h1>
              <p className="mt-2 text-sm font-semibold text-neutral-500">
                31 augustus 2026
              </p>
            </div>
            <p className="w-fit rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-black text-neutral-700">
              39 foto’s
            </p>
          </div>

          <div className="mt-4 inline-grid grid-cols-2 rounded-full border border-neutral-200 bg-neutral-50 p-1">
            {(['album', 'access'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPreviewMode(mode)}
                className={`rounded-full px-4 py-2 text-sm font-black transition ${
                  previewMode === mode
                    ? 'bg-[#d71920] text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-950'
                }`}
              >
                {mode === 'album' ? 'Album' : 'Toegang'}
              </button>
            ))}
          </div>
        </header>

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
            <nav className="mt-4 border-b border-neutral-200">
              <div className="grid grid-cols-4 gap-1">
                {navigation.map((item) => {
                  const isActive = activeSection === item.key

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveSection(item.key)}
                      className={`relative px-1 pb-3 pt-2 text-sm font-black transition sm:text-base ${
                        isActive
                          ? 'text-[#d71920]'
                          : 'text-neutral-500 hover:text-neutral-950'
                      }`}
                    >
                      {item.label}
                      {isActive ? (
                        <span className="absolute inset-x-2 bottom-0 h-1 rounded-full bg-[#d71920]" />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </nav>

            <div className="py-4 sm:py-5">
              {activeSection === 'photos' ? (
                <section className="space-y-4">
                  <div className="rounded-[1.35rem] border border-neutral-200 bg-white p-4 shadow-[0_10px_28px_rgba(20,20,20,0.06)]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-lg font-black tracking-[-0.02em] text-neutral-950">
                          Foto’s toevoegen
                        </h2>
                        <p className="mt-1 text-sm leading-5 text-neutral-600">
                          Upload je favoriete momenten naar het gedeelde album.
                        </p>
                      </div>
                      <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-[#d71920] px-5 py-3 text-sm font-black text-white shadow-[0_10px_22px_rgba(215,25,32,0.16)]">
                        Bestanden kiezen
                        <input type="file" multiple accept="image/*" className="sr-only" />
                      </label>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <label className="flex items-start gap-2 text-sm leading-5 text-neutral-700">
                        <input
                          type="checkbox"
                          checked={uploadConsent}
                          onChange={(event) => setUploadConsent(event.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-[#d71920]"
                        />
                        <span>Ik bevestig dat ik deze foto’s mag uploaden.</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setModal('upload-info')}
                        className="w-fit text-sm font-bold text-[#b51218] underline decoration-[#f0b4b8] underline-offset-4"
                      >
                        Meer informatie
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {photoCards.map((photo, index) => (
                      <article
                        key={photo.title}
                        className="overflow-hidden rounded-[1.25rem] border border-neutral-200 bg-white shadow-[0_8px_22px_rgba(20,20,20,0.06)]"
                      >
                        <div
                          className={`${photo.height} bg-gradient-to-br ${photo.tone} relative`}
                        >
                          <div className="absolute inset-3 rounded-[1rem] bg-white/35" />
                          <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/82 px-3 py-2 backdrop-blur">
                            <p className="truncate text-sm font-black text-neutral-950">
                              {photo.title}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2">
                          <p className="text-xs font-bold text-neutral-500">Vandaag</p>
                          <p className="text-xs font-black text-[#d71920]">#{index + 1}</p>
                        </div>
                      </article>
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
