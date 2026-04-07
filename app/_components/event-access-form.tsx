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
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={t.home.emailLabel}
        autoComplete="email"
        className="w-full rounded-full border border-[#191511] bg-[#FF9B42] px-6 py-4 text-center text-sm font-medium uppercase tracking-[0.28em] text-[#191511] placeholder:text-[#191511]"
      />

      <input
        value={code}
        onChange={(event) => setCode(event.target.value.toUpperCase())}
        placeholder={t.home.codeLabel}
        autoCapitalize="characters"
        autoCorrect="off"
        className="w-full rounded-full border border-[#191511] bg-[#FF9B42] px-6 py-4 text-center text-sm font-medium uppercase tracking-[0.28em] text-[#191511] placeholder:text-[#191511]"
      />

      <button
        type="submit"
        disabled={isPending}
        className={`inline-flex w-full items-center justify-center rounded-full border px-6 py-4 text-sm font-semibold uppercase tracking-[0.28em] ${
          isPending
            ? 'cursor-not-allowed border-[#d9c4ae] bg-[#efe2d0] text-[#8a7b6a]'
            : 'border-[#F28C18] bg-[#FFD244] text-[#191511] shadow-[0_12px_24px_rgba(255,210,68,0.28)] hover:bg-[#ffc629]'
        }`}
      >
        {isPending ? t.home.checkingAccess : t.home.accessButton}
      </button>

      <p className="text-center text-xs uppercase tracking-[0.16em] text-[#5d6775]">
        {eventIdentifier ? t.home.prefilledEvent : statusMessage}
      </p>
    </form>
  )
}
