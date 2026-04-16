import type { Metadata } from 'next'
import { LegalPage } from '@/app/_components/legal-page'

export const metadata: Metadata = {
  title: 'Algemene voorwaarden',
  description:
    'Lees de algemene voorwaarden van Photobooth Holland voor het gebruik van het gedeelde evenementalbum en gastenuploads.',
}

export default function TermsPage() {
  return <LegalPage />
}
