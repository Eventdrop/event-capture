import Image from 'next/image'
import Link from 'next/link'
import { LanguageSwitcher } from '@/app/_components/language-switcher'
import styles from '@/app/home.module.css'

type FeaturePageProps = {
  title: string
  eyebrow: string
  intro: string
  benefits: string[]
  visual: 'photos' | 'video' | 'guestbook' | 'live' | 'story' | 'poster'
}

const photos = ['/home-tile-2.png', '/home-tile-1.png', '/home-tile-3.png']

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" aria-label="EventDrop Sharing home" className={styles.brand}>
          <Image src="/eventdrop-brand.png" alt="EventDrop Sharing" width={540} height={540} priority />
        </Link>
        <nav aria-label="Hoofdnavigatie">
          <Link href="/#hoe-werkt-het">Hoe werkt het</Link>
          <Link href="/#mogelijkheden">Mogelijkheden</Link>
          <Link href="/#voor-events">Voor events</Link>
        </nav>
        <div className={styles.headerActions}>
          <div className={styles.languages}><LanguageSwitcher /></div>
          <Link href="/#jouw-event" className={styles.button}>Naar je event</Link>
        </div>
      </div>
    </header>
  )
}

function Visual({ type }: { type: FeaturePageProps['visual'] }) {
  if (type === 'poster') {
    return <Image src="/design-examples/memory-a3-landscape.webp" alt="" width={900} height={636} />
  }
  if (type === 'story') {
    return <Image src="/design-examples/story-portrait.webp" alt="" width={540} height={960} />
  }
  return (
    <div className={styles.featurePageGrid}>
      {photos.map((src) => <Image key={src} src={src} alt="" width={700} height={700} />)}
    </div>
  )
}

export function MarketingFeaturePage({ title, eyebrow, intro, benefits, visual }: FeaturePageProps) {
  return (
    <div className={styles.home}>
      <Header />
      <main>
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
          <div className={styles.featurePageVisual}>
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
