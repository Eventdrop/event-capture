'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/app/_components/language-provider'

type EventAccessFormProps = {
  eventIdentifier?: string
  returnTo?: string
}

export function EventAccessForm({
  eventIdentifier = '',
  returnTo = '',
}: EventAccessFormProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [statusMessage, setStatusMessage] = useState(t.home.accessHint)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim()) {
      setStatusMessage(t.home.emailRequired)
      return
    }

    if (!code.trim()) {
      setStatusMessage(t.home.codeRequired)
      return
    }

    setStatusMessage(t.home.checkingAccess)

    try {
      const response = await fetch('/api/public-events/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          identifier: eventIdentifier,
          returnTo,
        }),
      })

      const payload = (await response.json()) as {
        ok?: boolean
        redirectTo?: string
        error?: string
        errorCode?: string
      }

      if (!response.ok || !payload.redirectTo) {
        const message =
          payload.errorCode === 'INVALID_EMAIL'
            ? t.home.emailRequired
            : payload.errorCode === 'MISSING_CODE'
              ? t.home.codeRequired
              : payload.errorCode === 'INVALID_CODE'
                ? t.home.accessError
                : t.home.accessError

        throw new Error(message)
      }

      setStatusMessage(t.home.accessGranted)

      startTransition(() => {
        router.push(payload.redirectTo!)
      })
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : t.home.accessError
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#0B2742]">
            {t.home.emailLabel}
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
            className="w-full rounded-2xl border border-[#C8D3E5] bg-white px-4 py-3 text-sm text-[#0F2135] placeholder:text-[#7A90AA]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#0B2742]">
            {t.home.codeLabel}
          </label>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="YUNA26"
            autoCapitalize="characters"
            autoCorrect="off"
            className="w-full rounded-2xl border border-[#C8D3E5] bg-white px-4 py-3 text-sm uppercase tracking-[0.18em] text-[#0F2135] placeholder:tracking-[0.08em] placeholder:text-[#7A90AA]"
          />
        </div>
      </div>

      {eventIdentifier ? (
        <p className="rounded-2xl border border-[#D4DFEE] bg-[#F8FBFE] px-4 py-3 text-sm leading-6 text-[#33516F]">
          {t.home.prefilledEvent}
        </p>
      ) : (
        <p className="rounded-2xl border border-[#D4DFEE] bg-[#F8FBFE] px-4 py-3 text-sm leading-6 text-[#33516F]">
          {t.home.manualAccessHelp}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={`inline-flex w-full items-center justify-center rounded-full px-6 py-4 text-base font-semibold ${
          isPending
            ? 'cursor-not-allowed bg-[#9CAEC1] text-white'
            : 'bg-[#F58220] text-white shadow-[0_12px_24px_rgba(245,130,32,0.22)] hover:bg-[#DB6E12]'
        }`}
      >
        {isPending ? t.home.checkingAccess : t.home.accessButton}
      </button>

      <p className="text-sm leading-7 text-[#597594]">{statusMessage}</p>
    </form>
  )
}
