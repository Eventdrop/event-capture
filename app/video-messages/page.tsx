import type { Metadata } from 'next'
import { MarketingFeaturePage } from '@/app/_components/marketing-feature-page'

export const metadata: Metadata = {
  title: { absolute: 'Video Messages | EventDrop Sharing' },
  description: 'Verzamel korte persoonlijke videoboodschappen van gasten.',
}

export default function VideoMessagesPage() {
  return <MarketingFeaturePage title="Video Messages" eyebrow="PERSOONLIJKE BERICHTEN" intro="Gasten delen korte wensen, verhalen en felicitaties die je later opnieuw kunt bekijken." benefits={['Persoonlijker dan foto’s', 'Eenvoudig via mobiel', 'Bewaren na het event']} visual="video" />
}
