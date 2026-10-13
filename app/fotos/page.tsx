import type { Metadata } from 'next'
import { MarketingFeaturePage } from '@/app/_components/marketing-feature-page'

export const metadata: Metadata = {
  title: { absolute: "Foto's | EventDrop Sharing" },
  description: "Verzamel alle eventfoto's van gasten via EventDrop Sharing.",
}

export default function FotosPage() {
  return <MarketingFeaturePage feature="photos" />
}
