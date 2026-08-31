'use client'

import { useState } from 'react'

export default function SolutionFaq({ items }) {
  const [openIndex, setOpenIndex] = useState(0)

  if (!items?.length) return null

  return (
    <section className="solution-anchor bg-white py-[clamp(56px,7vw,96px)] text-[#101728]" id="faq">
      <div className="site-container grid gap-8 lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)]">
        <div className="max-w-[28rem]">
          <p className="mb-3 font-medium uppercase tracking-[.08em] text-[#2c3280]">FAQ</p>
          <h2 className="m-0 text-[clamp(1.55rem,1.8vw,2.2rem)] font-semibold leading-[1.18]">
            Questions teams usually ask
          </h2>
        </div>
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
