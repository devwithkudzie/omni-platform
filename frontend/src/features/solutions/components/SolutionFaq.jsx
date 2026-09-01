'use client'

import { useState } from 'react'
import SectionHead from '@/components/layout/SectionHead'

export default function SolutionFaq({ items }) {
  const [openIndex, setOpenIndex] = useState(0)

  if (!items?.length) return null

  return (
    <section className="solution-anchor bg-white py-[clamp(56px,7vw,96px)] text-[#101728]" id="faq">
      <div className="site-container">
        <SectionHead eyebrow="FAQ">Questions teams usually ask</SectionHead>
        <div className="border-t border-[#c5d2ea]">
          {items.map(([question, answer], index) => {
            const open = openIndex === index
            return (
              <article className="border-b border-[#c5d2ea]" key={question}>
                <button
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  type="button"
                >
                  <h3 className="m-0 text-base font-semibold leading-[1.35]">{question}</h3>
                  <span aria-hidden="true" className={`text-lg font-medium text-[#2c3280] ${open ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {open ? (
                  <p className="m-0 max-w-[38rem] pb-4 text-[0.95rem] font-normal leading-[1.65] text-[rgba(16,23,40,.64)]">
                    {answer}
                  </p>
                ) : null}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
