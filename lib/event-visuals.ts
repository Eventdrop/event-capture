import type { NormalizedEvent } from '@/lib/events'

export const placeholderVisuals = {
  homeBackground: '/home-hero-custom.png',
  eventBackground:
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  galleryBackground:
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  coverOne: '/home-tile-1.png',
  coverTwo: '/home-tile-2.png',
  coverThree: '/home-tile-3.png',
} as const

export function getEventBackground(event?: Pick<NormalizedEvent, 'backgroundImageUrl'> | null) {
  return event?.backgroundImageUrl || placeholderVisuals.eventBackground
}

export function getEventCover(event?: Pick<NormalizedEvent, 'coverImageUrl'> | null) {
  return event?.coverImageUrl || placeholderVisuals.coverOne
}
