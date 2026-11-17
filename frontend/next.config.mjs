import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isCpanelStaticExport = process.env.CPANEL_STATIC_EXPORT === '1'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isCpanelStaticExport ? { output: 'export', trailingSlash: true } : {}),
  outputFileTracingRoot: __dirname,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    ...(isCpanelStaticExport ? { unoptimized: true } : {}),
    remotePatterns: [],
  },
  // Static export can't serve redirects; cPanel gets the same rules via .htaccess
  // (scripts/build-cpanel-public-html.mjs).
  ...(isCpanelStaticExport
    ? {}
    : {
        async redirects() {
          return [
            { source: '/digital-marketing', destination: '/marketing-as-a-service', permanent: true },
            {
              source: '/solutions/ai-technology-solutions/digital-marketing',
              destination: '/marketing-as-a-service',
              permanent: true,
            },
          ]
        },
        // Local Next.js has no PHP routes. Proxy API calls to the PHP built-in server.
        async rewrites() {
          const apiOrigin = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080'
          return [
            {
              source: '/api/:path*',
              destination: `${apiOrigin.replace(/\/$/, '')}/api/:path*`,
            },
          ]
        },
      }),
}

export default nextConfig
