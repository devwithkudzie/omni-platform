'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { navMenu } from '@/components/navigation/navigation.data'

function isExternalHref(href = '') {
  return /^https?:\/\//i.test(href)
}

export default function MobileNav() {
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState({})

  function closeNav() {
    setNavOpen(false)
  }

  function toggleGroup(key) {
    setOpenGroups((current) => ({ ...current, [key]: !current[key] }))
  }

  function openDiscovery() {
    closeNav()
    window.dispatchEvent(new CustomEvent('omni:open-discovery'))
  }

  function openAssessment() {
    closeNav()
    window.dispatchEvent(new CustomEvent('omni:open-assessment'))
  }

  function renderLink(item, className = 'mobile-link') {
    const active = pathname === item.href
    const content = (
      <span>
        {item.icon ? <img className="mobile-link__mark" src={item.icon} alt="" /> : null}
        <span className="mobile-link__copy">
          <span className="mobile-link__label">{item.label}</span>
          {item.desc ? <span className="mobile-link__desc">{item.desc}</span> : null}
        </span>
      </span>
    )

    if (item.external || isExternalHref(item.href)) {
      return (
        <a key={`${item.label}-${item.href}`} className={className} href={item.href} target="_blank" rel="noreferrer" onClick={closeNav}>
          {content}
        </a>
      )
    }

    return (
      <Link key={`${item.label}-${item.href}`} className={`${className}${active ? ' is-active' : ''}`} href={item.href} onClick={closeNav}>
        {content}
      </Link>
    )
  }

  return (
    <header className="mobile-header">
      <div className="mobile-header__bar">
        <Link href="/" aria-label="OmniContact home" onClick={closeNav}>
          <img src="/logo.png" alt="OmniContact" width="92" height="36" />
        </Link>
        <button
          type="button"
          className={`mobile-header__toggle${navOpen ? ' is-open' : ''}`}
          aria-expanded={navOpen}
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setNavOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div className={`mobile-drawer-scrim${navOpen ? ' is-open' : ''}`} onClick={closeNav} />

      <aside className={`mobile-drawer${navOpen ? ' is-open' : ''}`} aria-hidden={!navOpen}>
        <div className="mobile-drawer__head">
          <img src="/logo.png" alt="OmniContact" width="92" height="36" />
          <button type="button" className="mobile-drawer__close" onClick={closeNav} aria-label="Close menu">
            <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <nav className="mobile-drawer__nav" aria-label="Mobile navigation">
          {navMenu.map((group) => {
            const key = `group:${group.label}`
            const open = !!openGroups[key]
            return (
              <section key={group.label} className="mobile-accordion">
                <button type="button" className="mobile-accordion__trigger" aria-expanded={open} onClick={() => toggleGroup(key)}>
                  <span>
                    <strong>{group.label}</strong>
                    <small>{group.tagline}</small>
                  </span>
                  <span aria-hidden="true">{open ? '−' : '+'}</span>
                </button>

                {open ? (
                  <div className="mobile-accordion__panel">
                    {renderLink({ label: `${group.label} overview`, desc: group.tagline, href: group.overviewHref }, 'mobile-link mobile-link--overview')}
                    {group.items.map((item) => {
                      if (!item.children?.length) return renderLink(item)

                      const childKey = `${group.label}:${item.label}`
                      const childOpen = !!openGroups[childKey]
                      return (
                        <div key={item.label} className="mobile-child-accordion">
                          <button type="button" className="mobile-accordion__trigger" aria-expanded={childOpen} onClick={() => toggleGroup(childKey)}>
                            <strong>{item.label}</strong>
                            <span aria-hidden="true">{childOpen ? '−' : '+'}</span>
                          </button>
                          {childOpen ? (
                            <div className="mobile-accordion__panel">
                              {renderLink(item, 'mobile-link mobile-link--overview')}
                              {item.children.map((child) => renderLink(child))}
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </section>
            )
          })}

          <button className="mobile-drawer__cta" type="button" onClick={openAssessment}>
            Get a Free Operations Assessment
          </button>
          <button className="mobile-drawer__cta" type="button" onClick={openDiscovery}>
            Book a discovery call
          </button>
        </nav>
      </aside>
    </header>
  )
}
