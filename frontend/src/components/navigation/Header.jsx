'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { navMenu } from '@/components/navigation/navigation.data'

const CLOSE_DELAY = 180

const navItems = [
  { label: 'Home', href: '/', current: (pathname) => pathname === '/' },
  { menu: 'Solutions' },
  { menu: 'Industries' },
  { menu: 'About Us' },
  { menu: 'Insights' },
]

// Header button per page; landing pages scroll to their own enquiry form.
const headerCtas = {
  '/arams': { label: 'Book a Demo' },
  '/data-annotation-labelling': { label: 'Request a POC' },
  '/marketing-as-a-service': { label: 'Get a Free Consultation' },
}
const defaultCta = { label: 'Get a Free Consultation' }

function groupContainsPath(group, pathname) {
  if (!group || pathname === '/') return false
  const hrefs = [group.overviewHref]
  group.items.forEach((item) => {
    hrefs.push(item.href)
    item.children?.forEach((child) => hrefs.push(child.href))
  })
  return hrefs.some((href) => href && !isExternalHref(href) && (pathname === href || pathname.startsWith(`${href}/`)))
}

function isExternalHref(href = '') {
  return /^https?:\/\//i.test(href)
}

function MenuLink({ item, className = 'mega-link', onClick }) {
  const linkClassName = `${className}${item.icon ? ' mega-link--with-mark' : ''}`
  const content = (
    <>
      {item.icon ? <img className="mega-link__mark" src={item.icon} alt="" /> : null}
      <span className="mega-link__copy">
        <span className="mega-link__label">{item.label}</span>
        {item.desc ? <span className="mega-link__desc">{item.desc}</span> : null}
      </span>
      <span className="mega-link__icon" aria-hidden="true">›</span>
    </>
  )

  if (item.external || isExternalHref(item.href)) {
    return (
      <a className={linkClassName} href={item.href} target="_blank" rel="noreferrer" onClick={onClick}>
        {content}
      </a>
    )
  }

  return (
    <Link className={linkClassName} href={item.href} onClick={onClick}>
      {content}
    </Link>
  )
}

export default function Header() {
  const pathname = usePathname()
  const [openMenuLabel, setOpenMenuLabel] = useState(null)
  const [activeCategoryByMenu, setActiveCategoryByMenu] = useState({})
  const closeTimerRef = useRef(null)

  const openGroup = useMemo(
    () => navMenu.find((group) => group.label === openMenuLabel),
    [openMenuLabel],
  )

  const activeCategory = openGroup
    ? openGroup.items[activeCategoryByMenu[openGroup.label] || 0] || openGroup.items[0]
    : null

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  function openMenu(label) {
    clearCloseTimer()
    setOpenMenuLabel(label)
  }

  function scheduleCloseMenu() {
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => setOpenMenuLabel(null), CLOSE_DELAY)
  }

  function closeMenu() {
    clearCloseTimer()
    setOpenMenuLabel(null)
  }

  function setActiveCategory(groupLabel, index) {
    setActiveCategoryByMenu((current) => ({ ...current, [groupLabel]: index }))
  }

  const cta = headerCtas[pathname] || defaultCta

  function startEnquiry() {
    const form = document.getElementById('enquire')
    if (!form) {
      openDiscovery()
      return
    }
    closeMenu()
    form.scrollIntoView({ behavior: 'smooth', block: 'center' })
    form.querySelector('input')?.focus({ preventScroll: true })
  }

  function openDiscovery() {
    closeMenu()
    window.dispatchEvent(new CustomEvent('omni:open-discovery'))
  }

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') closeMenu()
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      clearCloseTimer()
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function renderTrigger(group, className, caretClassName) {
    const isOpen = openMenuLabel === group.label
    return (
      <button
        key={group.label}
        type="button"
        className={`${className}${isOpen ? ' is-active' : ''}`}
        aria-expanded={isOpen}
        aria-controls={`mega-panel-${group.label}`}
        onMouseEnter={() => openMenu(group.label)}
        onMouseLeave={scheduleCloseMenu}
        onFocus={() => openMenu(group.label)}
      >
        {group.label}
        <span className={caretClassName} aria-hidden="true" />
      </button>
    )
  }

  const megaPanel = openGroup ? (
    <div
      id={`mega-panel-${openGroup.label}`}
      className="mega-panel"
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleCloseMenu}
    >
      <div className="site-container">
        <div className="mega-content">
          <div className="mega-content__header">
            <div>
              <p>{openGroup.tagline}</p>
              <h2>{openGroup.label}</h2>
            </div>
            <Link href={openGroup.overviewHref} onClick={closeMenu}>{openGroup.overviewLabel || 'Overview'} →</Link>
          </div>

          {openGroup.items.some((item) => item.children?.length) ? (
            <div className="mega-hierarchy">
              <div className="mega-categories" aria-label={`${openGroup.label} categories`}>
                {openGroup.items.map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    className={`mega-category${activeCategory === item ? ' is-active' : ''}`}
                    onMouseEnter={() => setActiveCategory(openGroup.label, index)}
                    onFocus={() => setActiveCategory(openGroup.label, index)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mega-links-grid">
                {(activeCategory?.children?.length ? activeCategory.children : openGroup.items).map((item) => (
                  <MenuLink key={`${item.label}-${item.href}`} item={item} onClick={closeMenu} />
                ))}
              </div>
            </div>
          ) : (
            <div className={`mega-links-grid mega-links-grid--flat${openGroup.label === 'Industries' ? ' mega-links-grid--two-column' : ''}`}>
              {openGroup.items.map((item) => (
                <MenuLink key={`${item.label}-${item.href}`} item={item} onClick={closeMenu} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null

  return (
    <header className="hh" onMouseLeave={scheduleCloseMenu}>
      <div className="site-container hh__bar">
        <Link className="hh__logo" href="/" aria-label="Yamurai OmniContact home">
          <img src="/logo-dark.png" alt="Yamurai OmniContact" width="190" height="52" />
        </Link>

        <nav className="hh__nav" aria-label="Primary navigation">
          {navItems.map((item) => {
            if (item.menu) {
              const group = navMenu.find((menuGroup) => menuGroup.label === item.menu)
              const current = groupContainsPath(group, pathname) ? ' is-current' : ''
              return renderTrigger(group, `hh__link hh__trigger${current}`, 'hh__caret')
            }
            return (
              <Link
                key={item.label}
                className={`hh__link${item.current?.(pathname) ? ' is-current' : ''}`}
                href={item.href}
                onMouseEnter={scheduleCloseMenu}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hh__actions">
          {cta.href ? (
            <Link className="hh__cta" href={cta.href}>
              {cta.label} <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <button className="hh__cta" type="button" onClick={startEnquiry}>
              {cta.label} <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>

      {megaPanel}
    </header>
  )
}
