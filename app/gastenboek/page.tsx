import type { Metadata } from 'next'
import { MarketingFeaturePage } from '@/app/_components/marketing-feature-page'

export const metadata: Metadata = {
  title: { absolute: 'Gastenboek | EventDrop Sharing' },
  description: 'Laat gasten persoonlijke berichten achterlaten in het digitale gastenboek.',
}

export default function GastenboekPage() {
  return <MarketingFeaturePage title="Gastenboek" eyebrow="WOORDEN OM TE BEWAREN" intro="Verzamel lieve wensen, herinneringen en berichten van gasten naast de gedeelde foto’s." benefits={['Persoonlijke berichten', 'Mooi bij het album', 'Later terug te lezen']} visual="guestbook" />
}
