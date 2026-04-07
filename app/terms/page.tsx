'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { useLanguage } from '@/app/_components/language-provider'

export default function TermsPage() {
  const { t } = useLanguage()
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_#faf6ef_0%,_#edf4fb_100%)]">
      <SiteHeader currentLabel={t.common.terms} />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12 md:px-10">
        <section className="rounded-[2rem] border border-[#D4DFEE] bg-white/88 p-7 shadow-[0_18px_54px_rgba(15,61,102,0.08)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-[#F7FAFD] px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-white"
            >
              {t.common.back}
            </button>

            <Link
              href="/"
              className="text-sm font-medium text-[#597594] underline decoration-[#C8D3E5] underline-offset-4"
            >
              EventDrop
            </Link>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6A84A3]">
            {t.common.terms}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0B2742]">
            {t.legal.termsTitle}
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#33516F]">
            {t.legal.termsIntro}
          </p>
        </section>

        {t.legal.termsSections.map((section) => (
          <section
            key={section.title}
            className="rounded-[1.8rem] border border-[#D4DFEE] bg-white/82 p-6 shadow-[0_12px_40px_rgba(15,61,102,0.06)]"
          >
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#0B2742]">
              {section.title}
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[#33516F]">
              {section.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#F58220]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <SiteFooter />
    </div>
  )
}
