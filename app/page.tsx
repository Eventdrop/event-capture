import type { Metadata } from 'next'
import MarketingHome from '@/app/_components/marketing-home'

export const metadata: Metadata = {
  title: { absolute: 'EventDrop | Alle herinneringen van jullie event op één plek' },
  description: 'Foto’s, video messages en persoonlijke berichten van jullie gasten, eenvoudig verzameld via één QR-code. Geen app nodig.',
  openGraph: {
    title: 'EventDrop | Alle herinneringen op één plek',
    description: 'Verzamel foto’s, video messages en gastenboekberichten via één QR-code.',
    url: '/',
  },
  twitter: {
    title: 'EventDrop | Alle herinneringen op één plek',
    description: 'Verzamel foto’s, video messages en gastenboekberichten via één QR-code.',
  },
}

export default function Home() {
  return <MarketingHome />
}
