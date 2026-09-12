import type { Metadata } from 'next'
import { MarketingFeaturePage } from '@/app/_components/marketing-feature-page'

export const metadata: Metadata = {
  title: { absolute: "Foto's | EventDrop Sharing" },
  description: "Verzamel alle eventfoto's van gasten via EventDrop Sharing.",
}

export default function FotosPage() {
  return <MarketingFeaturePage title="Foto's" eyebrow="EVENTDROP SHARING" intro="Laat gasten hun foto’s direct delen via één eenvoudige eventpagina. Alles komt samen in een privé album." benefits={['Geen app nodig', 'Direct vanaf telefoon', 'Alle perspectieven samen']} visual="photos" />
}
