import { brand } from '@/lib/brand'

export function getPublicAppUrl() {
  return brand.website.replace(/\/$/, '')
}
