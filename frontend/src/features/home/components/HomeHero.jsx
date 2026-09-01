'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HomeHero() {
  const [desktopReady, setDesktopReady] = useState(false)
  const [mobileReady, setMobileReady] = useState(false)

  return (
    <section className="home-hero">
      <video
        className={`home-hero__video${desktopReady ? ' is-ready' : ''}`}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        onCanPlay={() => setDesktopReady(true)}
        onPlaying={() => setDesktopReady(true)}
      >
        <source src="/hero.mp4" type="video/mp4" media="(min-width: 769px)" />
      </video>

      <div className="site-container home-hero__content">
        <div className="home-hero__copy">
          <p className="home-hero__eyebrow">
            AI-first customer operations
          </p>

          <h1>
            AI-Powered
            <br />
            CX Operations
            <br />
            <span className="home-hero__silver">for Enterprise Growth</span>
          </h1>

          <div className="home-hero__mobile-video-frame" aria-hidden="true">
            <video
              className={`home-hero__mobile-video${mobileReady ? ' is-ready' : ''}`}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              onCanPlay={() => setMobileReady(true)}
              onPlaying={() => setMobileReady(true)}
            >
              <source src="/mobile-hero.mp4" type="video/mp4" media="(max-width: 768px)" />
            </video>
          </div>

          <div className="home-hero__mobile-cta">
            <p className="home-hero__lede">
              Reduce cost-to-serve and elevate customer experience through AI automation,
              omnichannel delivery, and multilingual African operations.
            </p>

            <div className="home-hero__actions">
              <Link className="home-hero__primary" href="/site-tour">
                <span>Take a site tour</span>
                <span aria-hidden="true">→</span>
              </Link>

              <Link className="home-hero__secondary" href="/insights">
                <span>See case studies</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
