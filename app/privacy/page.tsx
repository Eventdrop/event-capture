import type { Metadata } from 'next'
import { LegalPage } from '@/app/_components/legal-page'

export const metadata: Metadata = {
  title: 'Privacyverklaring',
  description:
    'Lees hoe Photobooth Holland persoonsgegevens, uploads en technische gegevens verwerkt binnen het gedeelde evenementalbum.',
}

export default function PrivacyPage() {
  return <LegalPage />
}
