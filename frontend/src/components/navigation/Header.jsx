'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { navMenu } from '@/components/navigation/navigation.data'

const CLOSE_DELAY = 180

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

  function openAssessment() {
    closeMenu()
    window.dispatchEvent(new CustomEvent('omni:open-assessment'))
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

  return (
    <header className="desktop-header" onMouseLeave={scheduleCloseMenu}>
      <div className="site-container desktop-header__bar">
        <Link className="desktop-header__logo" href="/" aria-label="OmniContact home">
          <img src="/logo.png" alt="OmniContact" width="126" height="49" />
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navMenu.map((group) => {
            const isOpen = openMenuLabel === group.label
            return (
              <button
                key={group.label}
                type="button"
                className={`desktop-nav__trigger${isOpen ? ' is-active' : ''}`}
                aria-expanded={isOpen}
                aria-controls={`mega-panel-${group.label}`}
                onMouseEnter={() => openMenu(group.label)}
                onMouseLeave={scheduleCloseMenu}
                onFocus={() => openMenu(group.label)}
              >
                {group.label}
                <span className="desktop-nav__caret" aria-hidden="true" />
              </button>
            )
          })}
        </nav>

        <button className="desktop-header__cta" type="button" onClick={openAssessment}>Book discovery</button>
      </div>

      {openGroup ? (
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
                <Link href={openGroup.overviewHref} onClick={closeMenu}>Overview →</Link>
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
      ) : null}
    </header>
  )
}
