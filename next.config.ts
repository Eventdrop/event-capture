import type { NextConfig } from 'next'

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = []

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)

  remotePatterns.push({
    protocol: url.protocol.replace(':', '') as 'http' | 'https',
    hostname: url.hostname,
    pathname: '/storage/v1/object/public/**',
  })
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
}

export default nextConfig
