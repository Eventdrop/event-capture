import type { NormalizedEvent } from '@/lib/events'

export const placeholderVisuals = {
  homeBackground:
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  eventBackground:
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  galleryBackground:
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  coverOne:
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
  coverTwo:
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
  coverThree:
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
} as const

export function getEventBackground(event?: Pick<NormalizedEvent, 'backgroundImageUrl'> | null) {
  return event?.backgroundImageUrl || placeholderVisuals.eventBackground
}

export function getEventCover(event?: Pick<NormalizedEvent, 'coverImageUrl'> | null) {
  return event?.coverImageUrl || placeholderVisuals.coverOne
}
