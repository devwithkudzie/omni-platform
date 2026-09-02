'use client'

import { useEffect, useState } from 'react'
import LeadScoutAssessmentModal from '@/features/lead-scout/components/LeadScoutAssessmentModal'

export default function AssessmentModalProvider() {
  const [open, setOpen] = useState(false)
  const [initialGoal, setInitialGoal] = useState('')
  const [initialContext, setInitialContext] = useState(null)

  useEffect(() => {
    function handleOpenAssessment(event) {
      setInitialGoal(event.detail?.goal || '')
      setInitialContext(event.detail?.context || null)
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
      onClose={() => setOpen(false)}
      onBookCall={() => {
        setOpen(false)
        window.dispatchEvent(new CustomEvent('omni:open-discovery'))
      }}
    />
  )
}
