'use client'

import { useState } from 'react'
import SectionHead from '@/components/layout/SectionHead'

export default function FacilityTour({ tour }) {
  const [started, setStarted] = useState(false)

  if (!tour?.src) return null

  return (
    <section
      aria-labelledby="facility-tour-heading"
      className="solution-anchor sx-band"
      id="tour"
    >
      <div className="site-container">
        <SectionHead copy={tour.body} eyebrow={tour.eyebrow}>
          <span id="facility-tour-heading">{tour.heading}</span>
        </SectionHead>

        <div
          className="relative overflow-hidden bg-[#111425]"
          style={{ borderRadius: 'var(--radius)', height: 'min(640px, 78vh)', minHeight: 360 }}
        >
          {started ? (
            <iframe
              allow="xr-spatial-tracking; gyroscope; accelerometer"
              allowFullScreen
              className="h-full w-full border-0"
              src={tour.src}
              title={tour.title}
            />
          ) : (
            <button
              aria-label={tour.startLabel}
              className="relative grid h-full w-full place-items-center overflow-hidden text-left"
              onClick={() => setStarted(true)}
              type="button"
            >
              <span
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(8,19,48,.28) 0%, rgba(8,19,48,.72) 100%), url("${tour.poster}")`,
                }}
              />
              <span className="relative z-[1] grid justify-items-center gap-3 px-6 text-center">
                <span className="btn-omni">{tour.startLabel}</span>
                <span className="text-sm font-semibold text-white/80">
                  Loads in this page. Use full screen for VR.
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
