import type { Metadata } from 'next'
import { MarketingFeaturePage } from '@/app/_components/marketing-feature-page'

export const metadata: Metadata = {
  title: { absolute: 'Live Slideshow | EventDrop Sharing' },
  description: 'Foto’s van jullie gasten verschijnen tijdens het event op een scherm.',
}

export default function LiveTvPage() {
  return <MarketingFeaturePage feature="liveSlideshow" />
}
