import type { Metadata } from 'next'
import { MarketingFeaturePage } from '@/app/_components/marketing-feature-page'

export const metadata: Metadata = {
  title: { absolute: 'Gastenboek | EventDrop Sharing' },
  description: 'Laat gasten persoonlijke berichten achterlaten in het digitale gastenboek.',
}

export default function GastenboekPage() {
  return <MarketingFeaturePage feature="guestbook" />
}
