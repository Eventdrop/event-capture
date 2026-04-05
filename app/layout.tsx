import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EventDrop',
  description:
    'Collect guest photos and videos in a shared event album with a simple QR code flow.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-stone-50 text-stone-900">{children}</body>
    </html>
  )
}
