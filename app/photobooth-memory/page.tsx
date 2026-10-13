import type { Metadata } from 'next'
import { MarketingFeaturePage } from '@/app/_components/marketing-feature-page'

export const metadata: Metadata = {
  title: { absolute: 'Photobooth Memory | EventDrop Sharing' },
  description:
    'Maak van één of drie afgewerkte photobooth strips een verticale 9:16 memory compositie voor social en story sharing.',
  openGraph: {
    title: 'Photobooth Memory | EventDrop Sharing',
    description:
      'Photobooth strips blijven volledig zichtbaar in een verticale memory compositie.',
    url: '/photobooth-memory',
  },
}

export default function PhotoboothMemoryPage() {
  return <MarketingFeaturePage feature="photoboothMemory" />
}
