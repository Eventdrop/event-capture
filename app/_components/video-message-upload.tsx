'use client'

import { useEffect, useRef, useState } from 'react'
import { videoMessageUploadTranslations } from '@/lib/i18n'
import { useLanguage } from '@/app/_components/language-provider'
import { createVideoMessageUpload, validateVideoMessage, type VideoMessageError, type VideoMessageState } from '@/lib/video-message-upload'



export function VideoMessageUpload({
  identifier,
  onSuccess,
}: {
  identifier: string
  onSuccess: () => void
}) {
  const { locale } = useLanguage()
  const text = videoMessageUploadTranslations[locale]
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<VideoMessageState>('selecting')
  const [error, setError] = useState<VideoMessageError>()
  const input = useRef<HTMLInputElement>(null)
  const uploader = useRef<ReturnType<typeof createVideoMessageUpload> | null>(null)
  useEffect(() => {
    let mounted = true
    const controller = createVideoMessageUpload((next, reason) => {
      if (!mounted) return
      setState(next)
      setError(reason)
      if (next === 'success') {
        setFile(null)
        if (input.current) input.current.value = ''
        onSuccess()
      }
    })
    uploader.current = controller
    const leave = () => controller.cancel()
    window.addEventListener('pagehide', leave)
    return () => {
      mounted = false
      window.removeEventListener('pagehide', leave)
      controller.cancel()
    }
  }, [onSuccess])
  const busy = state === 'checking' || state === 'uploading' || state === 'finalizing'

  return (
    <section aria-labelledby="video-message-title" aria-busy={busy} className="mt-3 rounded-[1rem] border border-[#E3E7EC] bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.06)] sm:p-5">
      <h2 id="video-message-title" className="text-base font-bold text-[#161616]">{text.title}</h2>
      <p id="video-message-hint" className="mt-1 text-sm text-[#6B7280]">{text.hint}</p>
      <input
        ref={input} id="video-message-file" type="file" accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime,video/x-quicktime,video/mov"
        disabled={busy} aria-label={text.choose} aria-describedby="video-message-hint"
        className="sr-only"
        onChange={(event) => {
          const selected = event.target.files?.[0]
          if (!selected) return
          const invalid = validateVideoMessage(selected)
          setFile(invalid ? null : selected)
          setError(invalid || undefined)
          setState(invalid ? 'error' : 'selecting')
          if (invalid) event.target.value = ''
        }}
      />
      {file ? <p className="mt-3 break-all text-sm text-[#4B5563]">{file.name}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="rounded-full border border-[#C8D3E5] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F3D66] hover:bg-[#EDF4FB] disabled:opacity-60">{text.choose}</button>
        <button type="button" disabled={busy || !file} onClick={() => { if (file) void uploader.current?.start(identifier, file) }} className="rounded-full bg-[linear-gradient(135deg,#7f1424_0%,#b91f32_55%,#e32636_100%)] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(185,31,50,0.18)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50">{text.send}</button>
        {state === 'checking' || state === 'uploading' ? <button type="button" onClick={() => uploader.current?.cancel()} className="rounded-full border border-[#C8D3E5] px-3.5 py-2 text-xs font-semibold text-[#0F3D66]">{text.cancel}</button> : null}
      </div>
      <p role={state === 'error' ? 'alert' : 'status'} aria-live="polite" className={`mt-3 text-sm ${state === 'error' ? 'text-[#B91F32]' : 'text-[#4B5563]'}`}>
        {state === 'error' && error ? text[error] : state === 'selecting' ? text.choose : text[state as 'checking' | 'uploading' | 'finalizing' | 'success']}
      </p>
    </section>
  )
}
