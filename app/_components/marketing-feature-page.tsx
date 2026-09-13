import Image from 'next/image'
import Link from 'next/link'
import { MarketingFeatureNavigation, MarketingHeader, MarketingMobileFeatureMenu } from '@/app/_components/marketing-shell'
import styles from '@/app/home.module.css'

type FeaturePageProps = {
  title: string
  eyebrow: string
  intro: string
  benefits: string[]
  visual: 'photos' | 'video' | 'guestbook' | 'live' | 'story' | 'poster'
}

const visualAssets = {
  photos: { src: '/marketing/eventdrop-fotos-main.png', width: 1600, height: 1200, fit: 'wide' },
  guestbook: { src: '/marketing/eventdrop-guestbook-main.png', width: 1200, height: 1600, fit: 'contain' },
  live: { src: '/marketing/eventdrop-live-tv-main.png', width: 1600, height: 1200, fit: 'wide' },
  story: { src: '/marketing/eventdrop-story-creator-main.png', width: 941, height: 1672, fit: 'contain' },
  poster: { src: '/marketing/eventdrop-memory-poster-creator-main.png', width: 941, height: 1672, fit: 'contain' },
} as const

function Visual({ type }: { type: FeaturePageProps['visual'] }) {
  if (type === 'video') {
    return <div className={styles.featurePageVideoStack}>
      <div className={styles.featurePageVideoFrame}>
        <video src="/marketing/eventdrop-video-messages-wedding-main.mp4" muted playsInline loop autoPlay preload="metadata" className={styles.featurePageVideo} aria-label="Video Messages wedding preview" />
      </div>
      <div className={styles.featurePageVideoFrame}>
        <video src="/marketing/eventdrop-video-messages-business-main.mp4" muted playsInline loop autoPlay preload="metadata" className={styles.featurePageVideo} aria-label="Video Messages business preview" />
      </div>
    </div>
  }
  const asset = visualAssets[type]
  const frameClassName = `${styles.featurePageMediaFrame} ${asset.fit === 'wide' ? styles.featurePageMediaFrameWide : ''}`
  return <div className={frameClassName}><Image src={asset.src} alt="" width={asset.width} height={asset.height} className={styles.featurePageMedia} /></div>
}

export function MarketingFeaturePage({ title, eyebrow, intro, benefits, visual }: FeaturePageProps) {
  const visualClassName = [
    styles.featurePageVisual,
    visual === 'video' ? styles.featurePageVisualVideo : '',
    ['guestbook', 'story', 'poster'].includes(visual) ? styles.featurePageVisualVertical : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={styles.home}>
      <MarketingHeader />
      <MarketingMobileFeatureMenu />
      <main>
        <MarketingFeatureNavigation className={styles.desktopFeatureNav} />
        <section className={`${styles.container} ${styles.featurePageHero}`}>
          <div className={styles.photoboothCopy}>
            <p className={styles.eyebrow}><span /> {eyebrow}</p>
            <h1>{title}</h1>
            <p className={styles.intro}>{intro}</p>
            <div className={styles.photoboothActions}>
              <Link href="/#jouw-event" className={styles.button}>Naar je event</Link>
              <Link href="/" className={styles.textLink}>EventDrop Sharing <span>↗</span></Link>
            </div>
          </div>
          <div className={visualClassName}>
            <Visual type={visual} />
          </div>
        </section>
        <section className={`${styles.container} ${styles.photoboothBenefits}`}>
          {benefits.map((benefit) => (
            <article key={benefit}>
              <h2>{benefit}</h2>
              <p>Onderdeel van EventDrop Sharing voor één gedeelde eventervaring.</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
