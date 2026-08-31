'use client'

import Link from 'next/link'
import AssessmentModalButton from '@/components/assessment/AssessmentModalButton'

export default function TopBar() {
  return (
    <div className="top-bar">
      <div className="site-container top-bar__inner">
        <p>
          Empower women and girls in Zimbabwe to become digital leaders.{' '}
          <Link href="/about/project-ignite">Join Project Ignite</Link>
        </p>
        <AssessmentModalButton className="top-bar__cta" step="meeting">
          Book a discovery call
        </AssessmentModalButton>
      </div>
    </div>
  )
}
