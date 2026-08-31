'use client'

import { useEffect, useState } from 'react'
import LeadScoutAssessmentModal from '@/features/lead-scout/components/LeadScoutAssessmentModal'

export default function AssessmentModalProvider() {
  const [open, setOpen] = useState(false)
  const [initialGoal, setInitialGoal] = useState('')
  const [initialContext, setInitialContext] = useState(null)
  const [initialStep, setInitialStep] = useState('')

  useEffect(() => {
    function handleOpenAssessment(event) {
      setInitialGoal(event.detail?.goal || '')
      setInitialContext(event.detail?.context || null)
      setInitialStep(event.detail?.step || '')
      setOpen(true)
    }

    window.addEventListener('omni:open-assessment', handleOpenAssessment)
    return () => window.removeEventListener('omni:open-assessment', handleOpenAssessment)
  }, [])

  return (
    <LeadScoutAssessmentModal
      open={open}
      initialGoal={initialGoal}
      initialContext={initialContext}
      initialStep={initialStep}
      onClose={() => setOpen(false)}
    />
  )
}
