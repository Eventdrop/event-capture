import type { Metadata } from 'next'
import { MarketingFeaturePage } from '@/app/_components/marketing-feature-page'

export const metadata: Metadata = {
  title: { absolute: 'Memory Poster | EventDrop Sharing' },
  description: 'Maak een A3 Memory Poster met eventfoto’s uit het EventDrop Sharing album.',
}

export default function MemoryPosterPage() {
  return <MarketingFeaturePage title="Memory Poster" eyebrow="A3 HERINNERING" intro="Maak een A3 postercompositie met eventfoto’s uit jullie album. Los van Photobooth Memory, dat voor photobooth strips is." benefits={['Voor eventfoto’s', 'A3 postercompositie', 'Een herinnering voor aan de muur']} visual="poster" />
}
