import type { Metadata } from 'next'
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import { LanguageProvider } from '@/app/_components/language-provider'
import { getPublicAppUrl } from '@/lib/app-url'
import { brand } from '@/lib/brand'
import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans',
  weight: ['400', '500', '600', '700'],
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  metadataBase: new URL(getPublicAppUrl()),
  applicationName: brand.name,
  title: {
    default: 'Photobooth Holland | QR photobooth en gedeeld eventalbum',
    template: `%s | ${brand.name}`,
  },
  description:
    'Photobooth Holland helpt gasten om foto’s en video’s via een QR code te delen in één gedeeld eventalbum. Geschikt voor bruiloften, bedrijfsfeesten, verjaardagen en 360 photobooth activaties.',
  keywords: [
    'photobooth holland',
    'photobooth',
    '360 photobooth',
    'qr photobooth',
    'event photo sharing',
    'foto delen evenement',
    'gedeeld eventalbum',
    'bruiloft photobooth',
    'bedrijfsfeest photobooth',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: brand.name,
    locale: 'nl_NL',
    title: 'Photobooth Holland | QR photobooth en gedeeld eventalbum',
    description:
      'Laat gasten foto’s en video’s uploaden via QR code en verzamel alles van je evenement in één overzichtelijk album.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Photobooth Holland | QR photobooth en gedeeld eventalbum',
    description:
      'Een eenvoudige manier om foto’s en video’s van je evenement op één plek te verzamelen.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brand.name,
    alternateName: 'Photobooth Holland',
    url: getPublicAppUrl(),
    description:
      'QR photobooth en gedeeld eventalbum voor bruiloften, bedrijfsfeesten, verjaardagen en 360 photobooth activaties.',
    inLanguage: 'nl-NL',
    publisher: {
      '@type': 'Organization',
      name: 'Photobooth Holland',
      url: brand.website,
      email: brand.email,
      telephone: brand.phone,
    },
  }

  return (
    <html
      lang="nl"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-stone-50 text-stone-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
