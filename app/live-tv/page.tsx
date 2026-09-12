import type { Metadata } from 'next'
import { MarketingFeaturePage } from '@/app/_components/marketing-feature-page'

export const metadata: Metadata = {
  title: { absolute: 'Live TV | EventDrop Sharing' },
  description: 'Toon gedeelde eventmomenten live op een scherm tijdens het event.',
}

export default function LiveTvPage() {
  return <MarketingFeaturePage title="Live TV" eyebrow="SAMEN KIJKEN" intro="Laat gedeelde momenten tijdens het event op een scherm verschijnen, zodat iedereen mee kan genieten." benefits={['Live sfeer op scherm', 'Gasten doen mee', 'Mooi voor events']} visual="live" />
}
