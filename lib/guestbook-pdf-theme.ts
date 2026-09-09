export const guestbookPdfThemeKeys = [
  'wedding',
  'memories-together',
  'love-begins-here',
  'our-beginning',
  'forever-starts-here',
  'a-note-for-us',
  'love-notes',
  'cheers-memories',
  'share-the-fun',
  'night-to-remember',
  'party-people',
] as const

export type GuestbookPdfThemeKey = (typeof guestbookPdfThemeKeys)[number]

export const DEFAULT_GUESTBOOK_PDF_THEME: GuestbookPdfThemeKey = 'wedding'

export type GuestbookPdfThemeCategory = 'legacy' | 'party' | 'wedding'

export type GuestbookPdfPhotoFrame = {
  height: number
  radius?: number
  width: number
  x: number
  y: number
}

export type GuestbookPdfTextFrame = {
  align?: 'center' | 'left' | 'right'
  color?: string
  fontSize: number
  width: number
  x: number
  y: number
}

type GuestbookPdfThemeConfig = {
  category: GuestbookPdfThemeCategory
  coverBackground?: string
  eventText?: {
    date?: GuestbookPdfTextFrame
    name?: GuestbookPdfTextFrame
  }
  implemented: boolean
  label: string
  messageBackground?: string
  photoFrame?: GuestbookPdfPhotoFrame
  photoMask?: string
  photoRecommendation?: string
  previewImage?: string
  sortOrder: number
}

export const guestbookPdfThemeConfigs: Record<
  GuestbookPdfThemeKey,
  GuestbookPdfThemeConfig
> = {
  wedding: {
    category: 'legacy',
    coverBackground: '/pdf-assets/wedding/wedding-cover-background.png',
    implemented: true,
    label: 'Classic Wedding',
    messageBackground: '/pdf-assets/wedding/wedding-message-background.png',
    photoMask: '/pdf-assets/wedding/wedding-photo-mask.png',
    photoRecommendation:
      'Voor het mooiste resultaat: gebruik een verticale foto met voldoende ruimte rond de personen.',
    previewImage: '/pdf-assets/wedding/wedding-cover-background.png',
    sortOrder: 0,
  },
  'memories-together': {
    category: 'wedding',
    coverBackground: '/pdf-assets/guestbook-themes/memories-together.jpg',
    eventText: {
      date: { color: '#8D7651', fontSize: 26, width: 610, x: 402, y: 1680 },
      name: { color: '#191511', fontSize: 40, width: 720, x: 347, y: 1618 },
    },
    implemented: true,
    label: 'Memories Together',
    photoFrame: { height: 856, radius: 0, width: 638, x: 366, y: 524 },
    previewImage: '/pdf-assets/guestbook-themes/memories-together.jpg',
    sortOrder: 1,
  },
  'love-begins-here': {
    category: 'wedding',
    coverBackground: '/pdf-assets/guestbook-themes/love-begins-here.jpg',
    eventText: {
      date: { color: '#956F33', fontSize: 25, width: 610, x: 402, y: 1702 },
      name: { color: '#6D214F', fontSize: 40, width: 720, x: 347, y: 1642 },
    },
    implemented: true,
    label: 'Love Begins Here',
    photoFrame: { height: 908, radius: 0, width: 646, x: 394, y: 580 },
    previewImage: '/pdf-assets/guestbook-themes/love-begins-here.jpg',
    sortOrder: 2,
  },
  'our-beginning': {
    category: 'wedding',
    coverBackground: '/pdf-assets/guestbook-themes/our-beginning.jpg',
    eventText: {
      date: { color: '#69745F', fontSize: 25, width: 610, x: 402, y: 1738 },
      name: { color: '#596653', fontSize: 39, width: 720, x: 347, y: 1678 },
    },
    implemented: true,
    label: 'Our Beginning',
    photoFrame: { height: 960, radius: 72, width: 680, x: 376, y: 554 },
    previewImage: '/pdf-assets/guestbook-themes/our-beginning.jpg',
    sortOrder: 3,
  },
  'forever-starts-here': {
    category: 'wedding',
    coverBackground: '/pdf-assets/guestbook-themes/forever-starts-here.jpg',
    eventText: {
      date: { color: '#63725B', fontSize: 25, width: 610, x: 402, y: 1718 },
      name: { color: '#63725B', fontSize: 39, width: 720, x: 347, y: 1658 },
    },
    implemented: true,
    label: 'Forever Starts Here',
    photoFrame: { height: 960, radius: 72, width: 680, x: 376, y: 554 },
    previewImage: '/pdf-assets/guestbook-themes/forever-starts-here.jpg',
    sortOrder: 4,
  },
  'a-note-for-us': {
    category: 'wedding',
    coverBackground: '/pdf-assets/guestbook-themes/a-note-for-us.jpg',
    eventText: {
      date: { color: '#5C7890', fontSize: 24, width: 610, x: 402, y: 1735 },
      name: { color: '#1A2730', fontSize: 38, width: 720, x: 347, y: 1675 },
    },
    implemented: true,
    label: 'A Note for Us',
    photoFrame: { height: 960, radius: 72, width: 680, x: 376, y: 554 },
    previewImage: '/pdf-assets/guestbook-themes/a-note-for-us.jpg',
    sortOrder: 5,
  },
  'love-notes': {
    category: 'wedding',
    coverBackground: '/pdf-assets/guestbook-themes/love-notes.jpg',
    eventText: {
      date: { color: '#68755D', fontSize: 25, width: 610, x: 402, y: 1698 },
      name: { color: '#647157', fontSize: 39, width: 720, x: 347, y: 1638 },
    },
    implemented: true,
    label: 'Love Notes',
    photoFrame: { height: 960, radius: 72, width: 680, x: 376, y: 554 },
    previewImage: '/pdf-assets/guestbook-themes/love-notes.jpg',
    sortOrder: 6,
  },
  'cheers-memories': {
    category: 'party',
    coverBackground: '/pdf-assets/guestbook-themes/cheers-memories.jpg',
    eventText: {
      date: { color: '#E5D39B', fontSize: 24, width: 610, x: 402, y: 1685 },
      name: { color: '#F3D777', fontSize: 38, width: 720, x: 347, y: 1625 },
    },
    implemented: true,
    label: 'Cheers & Memories',
    photoFrame: { height: 956, radius: 72, width: 678, x: 376, y: 556 },
    previewImage: '/pdf-assets/guestbook-themes/cheers-memories.jpg',
    sortOrder: 7,
  },
  'share-the-fun': {
    category: 'party',
    coverBackground: '/pdf-assets/guestbook-themes/share-the-fun.jpg',
    eventText: {
      date: { color: '#4252A5', fontSize: 24, width: 560, x: 427, y: 1700 },
      name: { color: '#2E5FD0', fontSize: 37, width: 680, x: 367, y: 1640 },
    },
    implemented: true,
    label: 'Share the Fun',
    photoFrame: { height: 952, radius: 72, width: 676, x: 378, y: 558 },
    previewImage: '/pdf-assets/guestbook-themes/share-the-fun.jpg',
    sortOrder: 8,
  },
  'night-to-remember': {
    category: 'party',
    coverBackground: '/pdf-assets/guestbook-themes/night-to-remember.jpg',
    eventText: {
      date: { color: '#FFD16A', fontSize: 24, width: 560, x: 427, y: 1698 },
      name: { color: '#F08BFF', fontSize: 37, width: 680, x: 367, y: 1638 },
    },
    implemented: true,
    label: 'Night to Remember',
    photoFrame: { height: 958, radius: 72, width: 678, x: 378, y: 556 },
    previewImage: '/pdf-assets/guestbook-themes/night-to-remember.jpg',
    sortOrder: 9,
  },
  'party-people': {
    category: 'party',
    coverBackground: '/pdf-assets/guestbook-themes/party-people.jpg',
    eventText: {
      date: { color: '#F0B9FF', fontSize: 24, width: 560, x: 427, y: 1692 },
      name: { color: '#2AE4F0', fontSize: 37, width: 680, x: 367, y: 1632 },
    },
    implemented: true,
    label: 'Party People',
    photoFrame: { height: 956, radius: 72, width: 676, x: 378, y: 556 },
    previewImage: '/pdf-assets/guestbook-themes/party-people.jpg',
    sortOrder: 10,
  },
}

export const guestbookPdfThemeLabels: Record<GuestbookPdfThemeKey, string> =
  guestbookPdfThemeKeys.reduce(
    (labels, theme) => ({
      ...labels,
      [theme]: guestbookPdfThemeConfigs[theme].label,
    }),
    {} as Record<GuestbookPdfThemeKey, string>
  )

export function normalizeGuestbookPdfTheme(
  value?: string | null
): GuestbookPdfThemeKey {
  return guestbookPdfThemeKeys.includes(value as GuestbookPdfThemeKey)
    ? (value as GuestbookPdfThemeKey)
    : DEFAULT_GUESTBOOK_PDF_THEME
}

export function getGuestbookPdfThemeConfig(value?: string | null) {
  return guestbookPdfThemeConfigs[normalizeGuestbookPdfTheme(value)]
}
