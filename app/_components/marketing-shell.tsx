'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LanguageSwitcher } from '@/app/_components/language-switcher'
import { useLanguage } from '@/app/_components/language-provider'
import styles from '@/app/home.module.css'

function MarketingIcon({ kind }: { kind: 'arrow' }) {
  const paths = {
    arrow: 'M4 12h16m-6-6 6 6-6 6',
  }

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[kind]} /></svg>
}

function useMarketingLinks() {
  const { t } = useLanguage()
  const h = t.marketing

  return [
    [h.homeNav, '/'],
    [h.photos, '/fotos'],
    [h.videos, '/video-messages'],
    [h.guestbook, '/gastenboek'],
    [h.live, '/live-tv'],
    [h.story, '/story-creator'],
    [h.photoboothMemory, '/photobooth-memory'],
    [h.memoryPosterNav, '/memory-poster'],
  ] as const
}

function normalizePath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
}

function getAnchorHref(pathname: string, hash: string) {
  return normalizePath(pathname) === '/' ? hash : `/${hash}`
}

function isActivePath(pathname: string, href: string) {
  return normalizePath(pathname) === href
}

function Brand() {
  const h = useLanguage().t.marketing

  return (
    <Link href="/" aria-label={h.homeLabel} className={styles.brand}>
      <Image src="/eventdrop-brand.png" alt="EventDrop Sharing" width={540} height={540} priority />
    </Link>
  )
}

export function MarketingEntryLink({ className = styles.button }: { className?: string }) {
  const h = useLanguage().t.marketing
  const pathname = usePathname()

  return <Link href={getAnchorHref(pathname, '#jouw-event')} className={className}>{h.entry}<MarketingIcon kind="arrow" /></Link>
}

export function MarketingHeader() {
  const h = useLanguage().t.marketing
  const pathname = usePathname()

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Brand />
        <nav aria-label={h.nav}>
          <Link href={getAnchorHref(pathname, '#hoe-werkt-het')}>{h.how}</Link>
          <Link href={getAnchorHref(pathname, '#mogelijkheden')}>{h.features}</Link>
          <Link href={getAnchorHref(pathname, '#voor-events')}>{h.events}</Link>
        </nav>
        <div className={styles.headerActions}>
          <div className={styles.languages}><LanguageSwitcher /></div>
          <MarketingEntryLink />
        </div>
      </div>
    </header>
  )
}

export function MarketingFeatureNavigation({ className = '' }: { className?: string }) {
  const h = useLanguage().t.marketing
  const pathname = normalizePath(usePathname())
  const items = useMarketingLinks()

  return (
    <nav className={`${styles.featureNav} ${className}`} aria-label={h.featureNavigationLabel}>
      {items.map(([label, href]) => (
        <Link key={href} href={href} aria-current={isActivePath(pathname, href) ? 'page' : undefined}>{label}</Link>
      ))}
    </nav>
  )
}

export function MarketingMobileFeatureMenu() {
  const h = useLanguage().t.marketing
  const pathname = normalizePath(usePathname())
  const items = useMarketingLinks()
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.mobileFeatureNav}>
      <button type="button" className={styles.featureMenuButton} aria-expanded={open} aria-controls="feature-drawer" onClick={() => setOpen((current) => !current)}>
        <span aria-hidden="true"><i /><i /><i /></span>
        {h.featureNavigationLabel}
      </button>
      {open ? <>
        <button type="button" className={styles.featureDrawerBackdrop} aria-label="Sluit menu" onClick={() => setOpen(false)} />
        <aside id="feature-drawer" className={`${styles.featureDrawer} ${styles.featureDrawerOpen}`}>
          <div className={styles.featureDrawerHeader}>
            <strong>EventDrop Sharing</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Sluit menu">×</button>
          </div>
          <nav aria-label={h.featureNavigationLabel}>
            {items.map(([label, href]) => (
              <Link key={href} href={href} aria-current={isActivePath(pathname, href) ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link>
            ))}
          </nav>
        </aside>
      </> : null}
    </div>
  )
}
