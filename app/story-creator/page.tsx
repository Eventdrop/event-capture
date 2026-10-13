import type { Metadata } from 'next'
import { MarketingFeaturePage } from '@/app/_components/marketing-feature-page'

export const metadata: Metadata = {
  title: { absolute: 'Story Creator | EventDrop Sharing' },
  description: 'Maak verticale story composities met foto’s uit het EventDrop Sharing album.',
}

export default function StoryCreatorPage() {
  return <MarketingFeaturePage feature="storyCreator" />
}
