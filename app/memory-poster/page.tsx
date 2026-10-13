import type { Metadata } from 'next'
import { MarketingFeaturePage } from '@/app/_components/marketing-feature-page'

export const metadata: Metadata = {
  title: { absolute: 'Memory Poster | EventDrop Sharing' },
  description: 'Maak een A3 Memory Poster met eventfoto’s uit het EventDrop Sharing album.',
}

export default function MemoryPosterPage() {
  return <MarketingFeaturePage feature="memoryPoster" />
}
