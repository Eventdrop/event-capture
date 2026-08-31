'use client'

import { useState } from 'react'

type SectionKey = 'photos' | 'guestbook' | 'designs' | 'downloads'
type ModalKey = 'upload-info' | 'email-info' | null

const navigation: { key: SectionKey; label: string }[] = [
  { key: 'photos', label: 'Foto’s' },
  { key: 'guestbook', label: 'Gastenboek' },
  { key: 'designs', label: 'Ontwerpen' },
  { key: 'downloads', label: 'Downloaden' },
]

const photoCards = [
  { title: 'Dansvloer', tone: 'from-red-100 via-white to-stone-100' },
  { title: 'Familie', tone: 'from-stone-200 via-white to-red-50' },
  { title: 'Taartmoment', tone: 'from-white via-red-50 to-stone-200' },
  { title: 'Vrienden', tone: 'from-red-200 via-white to-neutral-100' },
  { title: 'Speech', tone: 'from-stone-100 via-white to-red-100' },
  { title: 'Proost', tone: 'from-white via-stone-100 to-red-100' },
]

const messages = [
  {
    name: 'Sanne',
    text: 'Wat een mooie avond. Alles voelde warm, persoonlijk en precies zoals Monique is.',
    time: '20:14',
  },
  {
    name: 'Peter en Linda',
    text: 'Gefeliciteerd met je 70e verjaardag. We hebben genoten van de foto’s, de muziek en alle lieve mensen om je heen.',
    time: '20:38',
  },
  {
    name: 'Eva',
    text: 'Een prachtige herinnering aan een bijzondere dag. Dank je wel dat we erbij mochten zijn.',
    time: '21:02',
  },
]

const designCards = [
  {
    title: 'Memory Poster A3',
    description: 'Een stijlvolle collage om te printen of cadeau te geven.',
    status: 'Beschikbaar',
  },
  {
    title: 'Instagram Story',
    description: 'Een verticaal deelbaar ontwerp voor socials.',
    status: 'Beschikbaar',
  },
]

export default function UiPreview7xPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>('photos')
  const [modal, setModal] = useState<ModalKey>(null)
  const [uploadConsent, setUploadConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)

  return (
    <main className="min-h-screen bg-white text-[#211f1d]">
      <div className="mx-auto flex w-full max-w-[480px] flex-col">
        <section className="border-b border-neutral-200 bg-white px-4 pb-4 pt-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d71920]">
                EventDrop
              </p>
              <h1 className="mt-1 text-xl font-black leading-tight text-[#171717]">
                Monique 70 jaar
              </h1>
            </div>
            <div className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Eventdatum
              </p>
              <p className="text-sm font-bold text-neutral-900">31 augustus 2026</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-sm font-bold text-neutral-950">Toegang tot het album</p>
            <p className="mt-1 text-sm leading-5 text-neutral-600">
              Vul je e-mailadres in om foto’s toe te voegen en later terug te vinden.
            </p>
            <label className="mt-3 block text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">
              E-mailadres
              <input
                type="email"
                placeholder="naam@example.com"
                className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm font-medium text-neutral-900 outline-none focus:border-[#d71920]"
              />
            </label>
            <button
              type="button"
              onClick={() => setModal('email-info')}
              className="mt-2 text-left text-xs font-bold text-[#b51218] underline decoration-[#f0b4b8] underline-offset-4"
            >
              Waarom vragen we dit?
            </button>
            <label className="mt-3 flex items-start gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs leading-5 text-neutral-600">
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
              className="mt-3 w-full rounded-xl bg-[#d71920] px-4 py-3 text-sm font-black text-white shadow-[0_10px_22px_rgba(215,25,32,0.18)]"
            >
              Verder
            </button>
          </div>
        </section>

        <nav className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 px-2 py-2 backdrop-blur">
          <div className="grid grid-cols-4 gap-1 rounded-2xl bg-neutral-100 p-1">
            {navigation.map((item) => {
              const isActive = activeSection === item.key

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveSection(item.key)}
                  className={`rounded-xl px-2 py-2 text-[11px] font-black transition ${
                    isActive
                      ? 'bg-white text-[#d71920] shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </nav>

        <div className="px-3 py-4">
          {activeSection === 'photos' ? (
            <section className="space-y-4">
              <div className="rounded-2xl border border-dashed border-[#e25a60] bg-[#fff6f6] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-black text-neutral-950">Foto’s toevoegen</h2>
                    <p className="mt-1 text-sm leading-5 text-neutral-600">
                      Voeg je favoriete momenten toe aan het gedeelde album.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-[#d71920]">
                    JPG / PNG
                  </span>
                </div>

                <label className="mt-4 flex cursor-pointer items-center justify-center rounded-xl bg-[#d71920] px-4 py-3 text-sm font-black text-white">
                  Bestanden kiezen
                  <input type="file" multiple accept="image/*" className="sr-only" />
                </label>

                <label className="mt-3 flex items-start gap-2 rounded-xl bg-white px-3 py-2.5 text-sm leading-5 text-neutral-700">
                  <input
                    type="checkbox"
                    checked={uploadConsent}
                    onChange={(event) => setUploadConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 accent-[#d71920]"
                  />
                  <span>Ik bevestig dat ik deze foto’s mag uploaden.</span>
                </label>
                <button
                  type="button"
                  onClick={() => setModal('upload-info')}
                  className="mt-2 text-sm font-bold text-[#b51218] underline decoration-[#f0b4b8] underline-offset-4"
                >
                  Meer informatie
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {photoCards.map((photo, index) => (
                  <article
                    key={photo.title}
                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                  >
                    <div className={`aspect-[4/5] bg-gradient-to-br ${photo.tone}`} />
                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                      <p className="truncate text-sm font-bold text-neutral-900">{photo.title}</p>
                      <p className="text-xs font-semibold text-neutral-400">#{index + 1}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {activeSection === 'guestbook' ? (
            <section className="space-y-3">
              <div>
                <h2 className="text-lg font-black text-neutral-950">Gastenboek</h2>
                <p className="mt-1 text-sm leading-5 text-neutral-600">
                  Berichten van gasten verschijnen naast de herinneringen van de avond.
                </p>
              </div>
              {messages.map((message) => (
                <article
                  key={`${message.name}-${message.time}`}
                  className="rounded-2xl border border-neutral-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-neutral-950">{message.name}</p>
                    <p className="text-xs font-bold text-neutral-400">{message.time}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-neutral-650">{message.text}</p>
                </article>
              ))}
            </section>
          ) : null}

          {activeSection === 'designs' ? (
            <section className="space-y-3">
              <div>
                <h2 className="text-lg font-black text-neutral-950">Ontwerpen</h2>
                <p className="mt-1 text-sm leading-5 text-neutral-600">
                  Kies een formaat om van de beste foto’s een kant-en-klaar ontwerp te maken.
                </p>
              </div>
              {designCards.map((design) => (
                <article
                  key={design.title}
                  className="rounded-2xl border border-neutral-200 bg-white p-4"
                >
                  <div className="flex gap-3">
                    <div className="h-20 w-16 rounded-xl bg-[linear-gradient(145deg,#d71920_0%,#ffffff_52%,#e5e5e5_100%)]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-black text-neutral-950">{design.title}</h3>
                        <span className="rounded-full bg-[#fff1f1] px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#d71920]">
                          {design.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-5 text-neutral-600">{design.description}</p>
                      <button
                        type="button"
                        className="mt-3 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-black text-neutral-900"
                      >
                        Voorbeeld bekijken
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          ) : null}

          {activeSection === 'downloads' ? (
            <section className="space-y-3">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <h2 className="text-lg font-black text-neutral-950">Downloaden</h2>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  Download losse favorieten of het complete album wanneer delen is vrijgegeven.
                </p>
                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    className="rounded-xl bg-[#d71920] px-4 py-3 text-sm font-black text-white"
                  >
                    Compleet album downloaden
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-black text-neutral-950"
                  >
                    Geselecteerde foto’s downloaden
                  </button>
                </div>
              </div>
              <div className="rounded-2xl bg-neutral-100 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-700">
                  86 foto’s beschikbaar voor Monique 70 jaar.
                </p>
              </div>
            </section>
          ) : null}
        </div>
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
