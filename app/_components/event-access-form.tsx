'use client'

import { useState, useTransition } from 'react'
import { useLanguage } from '@/app/_components/language-provider'
import { getPublicPath } from '@/lib/app-url'

type EventAccessFormProps = {
  eventIdentifier?: string
  returnTo?: string
  compact?: boolean
  requireCode?: boolean
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function EventAccessForm({
  eventIdentifier = '',
  returnTo = '',
  compact = false,
  requireCode = true,
}: EventAccessFormProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [statusMessage, setStatusMessage] = useState(t.home.accessHint)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !isValidEmail(email)) {
      setStatusMessage(t.home.emailRequired)
      return
    }

    if (requireCode && !code.trim()) {
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
        window.location.assign(getPublicPath(payload.redirectTo!))
      })
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : t.home.accessError
      )
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className={compact ? 'space-y-2.5' : 'space-y-4'}>
      <input
        type="text"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={t.home.emailLabel}
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-invalid={Boolean(email.trim()) && !isValidEmail(email)}
        className={`w-full rounded-full border text-[#191511] transition-colors outline-none placeholder:text-[#6f6256] focus:bg-[#f2e2cf] focus:ring-0 ${
          compact
            ? 'border-[#d7c5af] bg-[rgba(255,248,239,0.46)] px-3 py-1.5 text-[11px]'
            : 'border-[#191511] bg-[#FF9B42] px-6 py-4 text-sm font-medium uppercase tracking-[0.28em] text-center placeholder:text-[#191511]'
        }`}
      />

      {requireCode ? (
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder={t.home.codeLabel}
          autoCapitalize="characters"
          autoCorrect="off"
          className={`w-full rounded-full border text-[#191511] transition-colors outline-none focus:bg-[#f2e2cf] focus:ring-0 ${
            compact
              ? 'border-[#d7c5af] bg-[rgba(255,248,239,0.46)] px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] placeholder:text-[#6f6256]'
              : 'border-[#191511] bg-[#FF9B42] px-6 py-4 text-sm font-medium uppercase tracking-[0.28em] text-center placeholder:text-[#191511]'
          }`}
        />
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className={`inline-flex w-full items-center justify-center rounded-full border font-semibold uppercase ${
          compact
            ? 'border-[#F0B86E] bg-[#FFD244] px-3 py-1.5 text-[10px] tracking-[0.16em] shadow-[0_8px_16px_rgba(255,210,68,0.2)]'
            : 'px-6 py-4 text-sm tracking-[0.28em]'
        } ${
          isPending
            ? 'cursor-not-allowed border-[#d9c4ae] bg-[#efe2d0] text-[#8a7b6a]'
            : compact
              ? 'text-[#191511] hover:bg-[#ffc629]'
              : 'border-[#F28C18] bg-[#FFD244] text-[#191511] shadow-[0_12px_24px_rgba(255,210,68,0.28)] hover:bg-[#ffc629]'
        }`}
      >
        {isPending ? t.home.checkingAccess : t.home.accessButton}
      </button>

      <p
        className={`text-center uppercase text-[#5d6775] ${
          compact ? 'text-[9px] tracking-[0.08em]' : 'text-xs tracking-[0.16em]'
        }`}
      >
        {eventIdentifier
          ? requireCode
            ? t.home.prefilledEvent
            : t.home.prefilledEventEmailOnly
          : statusMessage}
      </p>
    </form>
  )
}
