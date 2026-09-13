'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { EventAccessForm } from '@/app/_components/event-access-form'
import { LANGUAGE_STORAGE_KEY, useLanguage } from '@/app/_components/language-provider'
import { MarketingEntryLink, MarketingFeatureNavigation, MarketingHeader, MarketingMobileFeatureMenu } from '@/app/_components/marketing-shell'
import { locales, type Locale } from '@/lib/i18n'
import { brand } from '@/lib/brand'
import styles from '../home.module.css'

const photos = ['/home-tile-2.png', '/home-tile-1.png', '/home-tile-3.png']
const featureAssets = [
  { kind: 'image', src: '/marketing/eventdrop-fotos-main.png', width: 1600, height: 1200, fit: 'cover' },
  { kind: 'video', src: '/marketing/eventdrop-video-messages-wedding-main.mp4', fit: 'cover' },
  { kind: 'image', src: '/marketing/eventdrop-guestbook-main.png', width: 1200, height: 1600, fit: 'contain' },
  { kind: 'image', src: '/marketing/eventdrop-live-tv-main.png', width: 1600, height: 1200, fit: 'cover' },
  { kind: 'image', src: '/marketing/eventdrop-story-creator-main.png', width: 941, height: 1672, fit: 'contain' },
  { kind: 'image', src: '/marketing/eventdrop-memory-poster-creator-main.png', width: 941, height: 1672, fit: 'contain' },
] as const

function Icon({ kind, className = '' }: { kind: string; className?: string }) {
  const paths: Record<string, string> = {
    photos: 'M4 7h4l2-3h4l2 3h4v13H4V7ZM9 13a3 3 0 1 0 6 0 3 3 0 0 0-6 0',
    video: 'M3 6h12v12H3V6Zm12 4 6-3v10l-6-3',
    book: 'M4 4h7l1 2 1-2h7v15h-7l-1 2-1-2H4V4Zm8 2v15',
    screen: 'M3 4h18v13H3V4Zm5 17h8m-4-4v4',
    story: 'M7 2h10v20H7V2Zm3 17h4m-4-13 4 3-4 3V6Z',
    poster: 'M4 2h16v20H4V2Zm3 3h4v6H7V5Zm7 0h3v6h-3V5ZM7 14h10v5H7v-5',
    qr: 'M3 3h6v6H3V3Zm12 0h6v6h-6V3ZM3 15h6v6H3v-6Zm12-1v3h3v4m3-7v3m-6 4h-3',
    lock: 'M5 10h14v11H5V10Zm3 0V6a4 4 0 0 1 8 0v4m-4 4v3',
    phone: 'M7 2h10v20H7V2Zm3 17h4',
    heart: 'M12 21 3.5 12.5a5.3 5.3 0 0 1 8.5-6 5.3 5.3 0 0 1 8.5 6L12 21Z',
    arrow: 'M4 12h16m-6-6 6 6-6 6',
    check: 'm5 12 4 4L19 6',
    calendar: 'M7 3v4m10-4v4M4 8h16M5 5h14v16H5V5Zm3 7h3m3 0h3m-9 4h3m3 0h3',
    mail: 'M4 6h16v12H4V6Zm0 1 8 6 8-6',
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}><path d={paths[kind] || paths.heart} /></svg>
}
function Photo({ index = 0, className = '', priority = false }: { index?: number; className?: string; priority?: boolean }) {
  return <div className={`${styles.photo} ${className}`}><Image src={photos[index % photos.length]} alt="" fill sizes="(max-width: 640px) 80vw, 400px" priority={priority} className={styles.photoImage} /></div>
}
function FeatureCardVisual({ index, title }: { index: number; title: string }) {
  const asset = featureAssets[index]
  const className = `${styles.featureAsset} ${asset.fit === 'contain' ? styles.featureAssetContain : ''}`
  if (asset.kind === 'video') {
    return <div className={`${className} ${styles.featureVideoAsset}`}><video src={asset.src} muted playsInline loop autoPlay preload="metadata" aria-label={title} /></div>
  }
  return <div className={className}><Image src={asset.src} alt="" width={asset.width} height={asset.height} sizes="(max-width: 760px) 45vw, 340px" /></div>
}
function BrandAccent({ text }: { text: string }) {
  const [before, after] = text.split('EventDrop')
  return <>{before}<em>EventDrop</em>{after}</>
}

function PhonePreview() {
  const h = useLanguage().t.marketing
  return <div className={styles.phone} aria-label={h.phoneLabel}>
    <div className={styles.phoneTop}><span>9:41</span><span>••• ▰</span></div>
    <div className={styles.phoneBrand}>Event<span>Drop</span><small>Sharing</small><Icon kind="heart" /></div>
    <div className={styles.phoneCover}><Photo priority /><div><small>{h.bestDay}</small><strong>{h.betterTogether}</strong></div></div>
    <div className={styles.phoneTabs}><b>{h.photos}</b><span>{h.guestbook}</span><span>{h.phoneVideos}</span></div>
    <div className={styles.phoneGrid}>{[1, 0, 2, 1].map((index, i) => <Photo key={i} index={index} />)}</div>
    <div className={styles.phoneUpload}><span>+</span> {h.shareMoments}</div>
  </div>
}
function HeroVisual() {
  const h = useLanguage().t.marketing
  return <div className={styles.heroVisual}>
    <div className={styles.halo} />
    <div className={styles.floatingPhoto}><Photo index={1} priority /><span>{h.dance}</span></div>
    <PhonePreview />
    <div className={styles.messageCard}><Icon kind="book" /><small>{h.bookSample}</small><p>“{h.heroQuote}”</p><span>♡ {h.later}</span></div>
    <div className={styles.videoBadge}><Icon kind="video" /><div><b>{h.videos}</b><span>{h.personalLater}</span></div></div>
  </div>
}
function ProductShowcase() {
  const h = useLanguage().t.marketing
  return <div className={styles.productShowcase}>
    <div className={styles.showcaseVisual}><PhonePreview /></div>
    <div className={styles.showcaseCopy}>
      <p className={styles.eyebrow}><span /> {h.previewEyebrow}</p>
      <h2>{h.dayToKeep}</h2>
      <p>{h.intro}</p>
      <ul>
        {[h.noApp, h.oneQr, h.private].map((item) => <li key={item}><Icon kind="check" />{item}</li>)}
      </ul>
    </div>
  </div>
}

function BottomQuickNav() {
  const h = useLanguage().t.marketing
  const items = [
    { label: h.bookQuickNav, href: brand.website, icon: 'calendar', primary: false },
    { label: h.contactQuickNav, href: brand.website, icon: 'phone', primary: false },
    { label: h.mailQuickNav, href: `mailto:${brand.email}`, icon: 'mail', primary: false },
    { label: h.eventQuickNav, href: '#jouw-event', icon: 'arrow', primary: true },
  ] as const
  return <nav className={styles.bottomQuickNav} aria-label={h.bottomQuickNavLabel}>{items.map((item) => <a key={item.label} href={item.href} className={item.primary ? styles.bottomQuickPrimary : undefined}><span className={styles.bottomQuickIcon}><Icon kind={item.icon} /></span><span className={styles.bottomQuickLabel}>{item.label}</span></a>)}</nav>
}

export default function Home() {
  const { t, locale, setLocale } = useLanguage()
  const h = t.marketing
  const initialized = useRef(false)
  useEffect(() => {
    document.title = `EventDrop Sharing | ${h.heroTitle} ${h.heroAccent}`
    const url = new URL(window.location.href)
    if (!initialized.current) {
      initialized.current = true
      let requested = url.searchParams.get('lang')
      if (!requested || !locales.includes(requested as Locale)) {
        try { requested = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) } catch { /* Use current language. */ }
      }
      if (requested && locales.includes(requested as Locale) && requested !== locale) {
        setLocale(requested as Locale)
        return
      }
    }
    url.searchParams.set('lang', locale)
    window.history.replaceState(window.history.state, '', url)
  }, [locale, setLocale, h.heroTitle, h.heroAccent])
  const features = [
  ['photos', h.photos, h.photoBody, '/fotos'],
  ['video', h.videos, h.videoBody, '/video-messages'],
  ['book', h.guestbook, h.bookBody, '/gastenboek'],
  ['screen', h.live, h.liveBody, '/live-tv'],
  ['story', h.story, h.storyBody, '/story-creator'],
  ['poster', h.poster, h.posterBody, '/memory-poster'],
] as const
  return <div className={styles.home} lang={locale}>
    <MarketingHeader />
    <MarketingMobileFeatureMenu />
    <main>
      <section className={`${styles.container} ${styles.hero}`}>
        <div className={styles.heroCopy}><p className={styles.eyebrow}><span /> {h.heroEyebrow}</p><h1>{h.heroTitle}<br /><em>{h.heroAccent}</em></h1><p className={styles.intro}>{h.intro}</p><div className={styles.heroActions}><MarketingEntryLink /><a href="#hoe-werkt-het" className={styles.textLink}>{h.watchHow} <span>↗</span></a></div><p className={styles.trust}><Icon kind="check" />{h.trust}</p></div><HeroVisual />
      </section>
      <MarketingFeatureNavigation className={styles.desktopFeatureNav} />
      <section className={`${styles.container} ${styles.section}`}><ProductShowcase /></section>
      <section id="mogelijkheden" className={`${styles.container} ${styles.section}`}><div className={styles.sectionHeading}><p className={styles.eyebrow}>{h.featureEyebrow}</p><h2>{h.featureTitle}</h2><p>{h.featureIntro}</p></div><div className={styles.features}>{features.map(([icon, title, body, href], i) => <a key={title} href={href} className={styles.feature}><div className={styles.featureTop}><span className={styles.iconBox}><Icon kind={icon} /></span><span className={styles.featureNumber}>0{i + 1}</span></div><h3>{title}</h3><p>{body}</p><FeatureCardVisual index={i} title={title} /></a>)}</div></section>
      <section className={styles.photoBand} aria-label={h.photoBandHeadline}><Image src="/marketing/home-feature-band.png" alt="" fill sizes="100vw" className={styles.photoBandImage} /><div className={styles.photoBandOverlay}><div className={styles.container}><h2>{h.photoBandHeadline}</h2><p>{h.photoBandBody}</p></div></div></section>
      <section id="hoe-werkt-het" className={styles.workflow}><div className={styles.container}><div className={styles.sectionHeading}><p className={styles.eyebrow}>{h.workflowEyebrow}</p><h2>{h.workflowTitle}</h2></div><ol className={styles.steps}>{[['qr', h.scan, h.scanBody], ['phone', h.upload, h.uploadBody], ['screen', h.share, h.shareBody], ['heart', h.relive, h.reliveBody]].map(([icon, title, body], i) => <li key={title}><div className={styles.stepIcon}><Icon kind={icon} /><span>0{i + 1}</span></div><h3>{title}</h3><p>{body}</p></li>)}</ol></div></section>
      <section id="voor-events" className={`${styles.container} ${styles.section} ${styles.useCases}`}><div className={styles.sectionHeading}><p className={styles.eyebrow}>{h.occasionsEyebrow}</p><h2>{h.occasionsTitle}</h2></div><div className={styles.occasions}>{[[h.weddings, h.weddingBody], [h.parties, h.partyBody], [h.corporate, h.corporateBody]].map(([title, body], i) => <article key={title}><Photo index={i} /><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></section>
      <section id="jouw-event" className={`${styles.container} ${styles.access}`}><div className={styles.accessCopy}><p className={styles.eyebrow}>{h.accessEyebrow}</p><h2><BrandAccent text={h.accessTitle} /></h2><p>{h.accessIntro}</p><div className={styles.accessDetail}><Icon kind="lock" /><span>{h.accessHelp}</span></div></div><div className={styles.formCard}><div className={styles.formHeading}><h3>{h.entry}</h3></div><EventAccessForm /></div></section>
    </main>
    <BottomQuickNav />
    <footer className={`${styles.container} ${styles.footer}`}><a href="/" aria-label={h.homeLabel} className={styles.brand}><Image src="/eventdrop-brand.png" alt="EventDrop Sharing" width={540} height={540} /></a><p>{h.footer}</p><div><a href="/privacy">{t.common.privacy}</a><a href="/terms">{t.common.terms}</a></div></footer>
  </div>
}
