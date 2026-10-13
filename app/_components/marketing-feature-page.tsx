'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/app/_components/language-provider'
import { MarketingFeatureNavigation, MarketingHeader, MarketingMobileFeatureMenu } from '@/app/_components/marketing-shell'
import styles from '@/app/home.module.css'

export type MarketingFeatureKey =
  | 'photos'
  | 'videoMessages'
  | 'guestbook'
  | 'liveSlideshow'
  | 'storyCreator'
  | 'photoboothMemory'
  | 'memoryPoster'

type FeatureAsset = {
  src: string
  width: number
  height: number
  fit: 'cover' | 'contain'
  shape: 'wide' | 'vertical'
}

const featureAssets: Record<Exclude<MarketingFeatureKey, 'videoMessages'>, FeatureAsset> = {
  photos: { src: '/marketing/eventdrop-fotos-main.png', width: 1600, height: 1200, fit: 'cover', shape: 'wide' },
  guestbook: { src: '/marketing/eventdrop-guestbook-main.png', width: 1200, height: 1600, fit: 'contain', shape: 'vertical' },
  liveSlideshow: { src: '/marketing/eventdrop-live-tv-main.png', width: 1600, height: 1200, fit: 'cover', shape: 'wide' },
  storyCreator: { src: '/marketing/eventdrop-story-creator-main.png', width: 941, height: 1672, fit: 'contain', shape: 'vertical' },
  photoboothMemory: { src: '/marketing/eventdrop-photobooth-memory-creator-main.png', width: 941, height: 1672, fit: 'contain', shape: 'vertical' },
  memoryPoster: { src: '/marketing/eventdrop-memory-poster-creator-main.png', width: 941, height: 1672, fit: 'contain', shape: 'vertical' },
}

function Icon({ kind }: { kind: 'arrow' | 'book' | 'check' | 'heart' | 'screen' | 'video' }) {
  const paths = {
    arrow: 'M4 12h16m-6-6 6 6-6 6',
    book: 'M4 4h7l1 2 1-2h7v15h-7l-1 2-1-2H4V4Zm8 2v15',
    check: 'm5 12 4 4L19 6',
    heart: 'M12 21 3.5 12.5a5.3 5.3 0 0 1 8.5-6 5.3 5.3 0 0 1 8.5 6L12 21Z',
    screen: 'M3 4h18v13H3V4Zm5 17h8m-4-4v4',
    video: 'M3 6h12v12H3V6Zm12 4 6-3v10l-6-3',
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[kind]} /></svg>
}

function FeatureHeroVisual({ feature }: { feature: MarketingFeatureKey }) {
  const h = useLanguage().t.marketing
  const text = h.featurePages[feature]
  if (feature === 'videoMessages') {
    return (
      <div className={styles.featureHeroVideoPair}>
        {['/marketing/eventdrop-video-messages-wedding-main.mp4', '/marketing/eventdrop-video-messages-business-main.mp4'].map((src) => (
          <div key={src} className={styles.featureHeroVideoCard}>
            <video src={src} muted playsInline loop autoPlay preload="metadata" aria-label={text.visualCaption} />
          </div>
        ))}
      </div>
    )
  }

  const asset = featureAssets[feature]
  const className = [
    styles.featureHeroProduct,
    asset.shape === 'vertical' ? styles.featureHeroProductVertical : styles.featureHeroProductWide,
  ].join(' ')

  return (
    <div className={className}>
      <Image src={asset.src} alt="" width={asset.width} height={asset.height} priority />
    </div>
  )
}

export function MarketingFeaturePage({ feature }: { feature: MarketingFeatureKey }) {
  const { t, locale } = useLanguage()
  const h = t.marketing
  const page = h.featurePages[feature]

  return (
    <div className={styles.home} lang={locale}>
      <MarketingHeader />
      <MarketingMobileFeatureMenu />
      <main>
        <MarketingFeatureNavigation className={styles.desktopFeatureNav} />
        <section className={`${styles.container} ${styles.hero} ${styles.marketingFeatureHero}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span /> {page.eyebrow}</p>
            <h1>{page.heroTitle}<br /><em>{page.heroAccent}</em></h1>
            <p className={styles.intro}>{page.intro}</p>
            <p className={styles.featurePackageLabel}>{page.packageLabel}</p>
            <div className={styles.heroActions}>
              <Link href="/#jouw-event" className={styles.button}>{h.entry}<Icon kind="arrow" /></Link>
              <Link href="/" className={styles.textLink}>EventDrop Sharing <span>↗</span></Link>
            </div>
            {feature === 'photoboothMemory' ? <p className={styles.featureHeroNote}>{h.packagePhotoboothNote}</p> : null}
          </div>
          <FeatureHeroVisual feature={feature} />
        </section>
        <section className={`${styles.container} ${styles.photoboothBenefits}`}>
          {page.benefits.map((benefit) => (
            <article key={benefit.title}>
              <h2>{benefit.title}</h2>
              <p>{benefit.body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
