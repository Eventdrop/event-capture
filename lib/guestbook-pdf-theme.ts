export const guestbookPdfThemeKeys = [
  'wedding',
  'birthday',
  'elegant',
  'business',
] as const

export type GuestbookPdfThemeKey = (typeof guestbookPdfThemeKeys)[number]

export const DEFAULT_GUESTBOOK_PDF_THEME: GuestbookPdfThemeKey = 'wedding'

type GuestbookPdfThemeConfig = {
  coverBackground?: string
  implemented: boolean
  label: string
  messageBackground?: string
  photoMask?: string
  photoRecommendation?: string
  previewImage?: string
}

export const guestbookPdfThemeConfigs: Record<
  GuestbookPdfThemeKey,
  GuestbookPdfThemeConfig
> = {
  birthday: {
    implemented: false,
    label: 'Birthday',
  },
  business: {
    implemented: false,
    label: 'Business',
  },
  elegant: {
    implemented: false,
    label: 'Elegant',
  },
  wedding: {
    coverBackground: '/pdf-assets/wedding/wedding-cover-background.png',
    implemented: true,
    label: 'Wedding',
    messageBackground: '/pdf-assets/wedding/wedding-message-background.png',
    photoMask: '/pdf-assets/wedding/wedding-photo-mask.png',
    photoRecommendation:
      'Voor het mooiste resultaat: gebruik een verticale foto met voldoende ruimte rond de personen.',
    previewImage: '/pdf-assets/wedding/wedding-cover-background.png',
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
