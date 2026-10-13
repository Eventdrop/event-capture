import type { Metadata } from 'next'
import { MarketingFeaturePage } from '@/app/_components/marketing-feature-page'

export const metadata: Metadata = {
  title: { absolute: 'Video Messages | EventDrop Sharing' },
  description: 'Verzamel korte persoonlijke videoboodschappen van gasten.',
}

export default function VideoMessagesPage() {
  return <MarketingFeaturePage feature="videoMessages" />
}
