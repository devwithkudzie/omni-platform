import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isCpanelStaticExport = process.env.CPANEL_STATIC_EXPORT === '1'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isCpanelStaticExport ? { output: 'export' } : {}),
  outputFileTracingRoot: __dirname,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    ...(isCpanelStaticExport ? { unoptimized: true } : {}),
    remotePatterns: [],
  },
}

export default nextConfig
