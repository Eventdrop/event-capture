import type { Metadata } from 'next'
import ThemeSelection from '@/app/theme-select/[token]/theme-selection'

export const metadata: Metadata = {
  title: 'Guestbook · EventDrop Sharing',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return <ThemeSelection token={code} />
}
