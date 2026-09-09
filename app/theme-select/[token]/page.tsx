import type { Metadata } from 'next'
import ThemeSelection from './theme-selection'

export const metadata: Metadata = {
  title: 'Kies jullie gastenboek',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <ThemeSelection token={token} />
}
