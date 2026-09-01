'use client'

const PREFETCH_FLAG = 'data-omni-site-tour-prefetch'

export function prefetchSiteTour() {
  if (typeof document === 'undefined') return
  if (document.head.querySelector(`[${PREFETCH_FLAG}]`)) return

  const hosts = [
    'https://omnicontact.viewin360.co',
    'https://kuula.co',
    'https://static.kuula.io',
  ]

  hosts.forEach((href) => {
    const preconnect = document.createElement('link')
    preconnect.rel = 'preconnect'
    preconnect.href = href
    preconnect.crossOrigin = 'anonymous'
    preconnect.setAttribute(PREFETCH_FLAG, '')
    document.head.appendChild(preconnect)

    const dns = document.createElement('link')
    dns.rel = 'dns-prefetch'
    dns.href = href
    dns.setAttribute(PREFETCH_FLAG, '')
    document.head.appendChild(dns)
  })
}
