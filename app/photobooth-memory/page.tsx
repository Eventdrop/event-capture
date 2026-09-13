import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MarketingFeatureNavigation, MarketingHeader, MarketingMobileFeatureMenu } from '@/app/_components/marketing-shell'
import styles from '@/app/home.module.css'

export const metadata: Metadata = {
  title: { absolute: 'Photobooth Memory | EventDrop Sharing' },
  description:
    'Maak van één of drie afgewerkte photobooth strips een verticale 9:16 memory compositie voor social en story sharing.',
  openGraph: {
    title: 'Photobooth Memory | EventDrop Sharing',
    description:
      'Photobooth strips blijven volledig zichtbaar in een verticale memory compositie.',
    url: '/photobooth-memory',
  },
}

export default function PhotoboothMemoryPage() {
  return (
    <div className={styles.home}>
      <MarketingHeader />
      <MarketingMobileFeatureMenu />
      <main>
        <MarketingFeatureNavigation className={styles.desktopFeatureNav} />
        <section className={`${styles.container} ${styles.photoboothHero}`}>
          <div className={styles.photoboothCopy}>
            <p className={styles.eyebrow}><span /> SOCIAL MEMORY VOOR PHOTOBOOTH STRIPS</p>
            <h1>Photobooth Memory</h1>
            <p className={styles.intro}>
              Gebruik afgewerkte photobooth strip-afbeeldingen als één complete compositie voor stories en socials. De strip blijft heel: geen cropping, geen splitsing.
            </p>
            <div className={styles.photoboothActions}>
              <Link href="/#jouw-event" className={styles.button}>Naar je event</Link>
              <Link href="/" className={styles.textLink}>EventDrop Sharing <span>↗</span></Link>
            </div>
          </div>
          <div className={`${styles.photoboothVisual} ${styles.featurePageVisual} ${styles.featurePageVisualVertical}`} aria-label="Voorbeeld van een verticale Photobooth Memory compositie">
            <div className={styles.featurePageMediaFrame}>
              <Image src="/marketing/eventdrop-photobooth-memory-creator-main.png" alt="Photobooth Memory voorbeeld met afgewerkte photobooth strips" width={941} height={1672} priority className={styles.featurePageMedia} />
            </div>
          </div>
        </section>

        <section className={`${styles.container} ${styles.photoboothBenefits}`}>
          {[
            ['1 of 3 strips', 'Maak een compositie met één centrale strip of drie strips met subtiele diepte.'],
            ['Volledige strip zichtbaar', 'De photobooth strip blijft intact, zonder bijsnijden of losse fotovakken.'],
            ['Gemaakt voor stories', 'De verticale 9:16 presentatie is direct geschikt om te delen.'],
          ].map(([title, body]) => (
            <article key={title}>
              <h2>{title}</h2>
              <p>{body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
