'use client'

import { useEffect, useRef, useState } from 'react'
import { prefetchSiteTour } from '@/features/about/lib/prefetchSiteTour'
import { siteTourPage } from '@/features/about/data/siteTour'

const LOAD_TIMEOUT_MS = 14000

export default function SiteTourPage() {
  const tour = siteTourPage.tour
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const loadTimerRef = useRef(null)

  useEffect(() => {
    prefetchSiteTour()
  }, [])

  useEffect(() => {
    setLoaded(false)
    setFailed(false)
    loadTimerRef.current = window.setTimeout(() => {
      setFailed(true)
    }, LOAD_TIMEOUT_MS)

    return () => {
      if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current)
    }
  }, [reloadKey])

  function handleLoaded() {
    if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current)
    setLoaded(true)
    setFailed(false)
  }

  function retry() {
    setReloadKey((current) => current + 1)
  }

  return (
    <section className="site-tour-stage" id="tour">
      <div className="site-container">
        <div className="site-tour-stage__frame">
          <iframe
            key={reloadKey}
            allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
            allowFullScreen
            className={`site-tour-stage__iframe${loaded ? ' is-ready' : ''}`}
            loading="eager"
            onLoad={handleLoaded}
            referrerPolicy="strict-origin-when-cross-origin"
            src={tour.src}
            title={tour.title}
          />
          {!loaded && !failed ? (
            <div className="site-tour-stage__loading" role="status">
              <span className="site-tour-stage__spinner" aria-hidden="true" />
              <p>Loading tour preview…</p>
            </div>
          ) : null}
          {failed ? (
            <div className="site-tour-stage__fallback">
              <p>The tour is taking too long to load on this connection.</p>
              <div className="site-tour-stage__fallback-actions">
                <button type="button" onClick={retry}>
                  Try again
                </button>
                <a href={tour.src} rel="noreferrer" target="_blank">
                  Open tour in a new tab
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
