'use client'

import { useCallback, useEffect, useState } from 'react'
import DiscoveryModal from './DiscoveryModal'

function isDiscoveryHref(href) {
  if (!href) return false
  try {
    const url = new URL(href, window.location.origin)
    return url.origin === window.location.origin && url.pathname === '/discovery'
  } catch {
    return href === '/discovery'
  }
}

export default function DiscoveryModalProvider() {
  const [open, setOpen] = useState(false)
  const [initialContact, setInitialContact] = useState({})

  const openModal = useCallback((contact = {}) => {
    setInitialContact(contact)
    setOpen(true)
  }, [])
  const closeModal = useCallback(() => setOpen(false), [])

  useEffect(() => {
    function handleClick(event) {
      const link = event.target.closest?.('a[href]')
      if (!link || !isDiscoveryHref(link.getAttribute('href'))) return

      event.preventDefault()
      openModal()
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [openModal])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('discovery') !== '1') return
    openModal()
    window.history.replaceState(null, '', '/')
  }, [openModal])

  useEffect(() => {
    function handleOpenDiscovery(event) {
      openModal(event.detail?.contact || {})
    }

    window.addEventListener('omni:open-discovery', handleOpenDiscovery)
    return () => window.removeEventListener('omni:open-discovery', handleOpenDiscovery)
  }, [openModal])

  return (
    <DiscoveryModal open={open} onClose={closeModal} initialContact={initialContact} />
  )
}
