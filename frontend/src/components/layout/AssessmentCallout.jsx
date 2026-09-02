'use client'

import { ASSESSMENT_COPY } from '@/config/assessment'
import AssessmentModalButton from '@/components/assessment/AssessmentModalButton'
import { usePathname } from 'next/navigation'

export default function AssessmentCallout() {
  const pathname = usePathname()
  if (pathname === '/assessment') return null

  return (
    <div className="assessment-callout">
      <div className="site-container">
        <AssessmentModalButton
          className="assessment-callout__btn"
          aria-label={ASSESSMENT_COPY.ctaLong}
        >
          <span className="assessment-callout__full">{ASSESSMENT_COPY.ctaLong}</span>
          <span className="assessment-callout__short">{ASSESSMENT_COPY.ctaShort}</span>
          <span className="assessment-callout__arrow" aria-hidden="true">
            →
          </span>
        </AssessmentModalButton>
      </div>
    </div>
  )
}
