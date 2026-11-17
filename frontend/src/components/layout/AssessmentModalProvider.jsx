'use client'

import { useEffect, useState } from 'react'
import LeadScoutAssessmentModal from '@/features/lead-scout/components/LeadScoutAssessmentModal'
import MarketingHealthCheckModal from '@/features/maas-health-check/components/MarketingHealthCheckModal'
import { MARKETING_HEALTH_EVENT } from '@/features/maas-health-check/data/marketingHealthCheck'

export default function AssessmentModalProvider() {
  const [open, setOpen] = useState(false)
  const [healthOpen, setHealthOpen] = useState(false)
  const [initialGoal, setInitialGoal] = useState('')
  const [initialContext, setInitialContext] = useState(null)

  useEffect(() => {
    function handleOpenAssessment(event) {
      const context = event.detail?.context || null
      const isMarketingHealth = context?.type === 'maas_health_check'
        || context?.title === 'Digital Marketing Health Check'
        || event.detail?.goal === 'digital_marketing_health'

      if (isMarketingHealth) {
        setHealthOpen(true)
        return
      }

      setInitialGoal(event.detail?.goal || '')
      setInitialContext(context)
      setOpen(true)
    }

    function handleOpenMarketingHealth() {
      setHealthOpen(true)
    }

    window.addEventListener('omni:open-assessment', handleOpenAssessment)
    window.addEventListener(MARKETING_HEALTH_EVENT, handleOpenMarketingHealth)
    return () => {
      window.removeEventListener('omni:open-assessment', handleOpenAssessment)
      window.removeEventListener(MARKETING_HEALTH_EVENT, handleOpenMarketingHealth)
    }
  }, [])

  return (
    <>
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
      <MarketingHealthCheckModal
        open={healthOpen}
        onClose={() => setHealthOpen(false)}
        onBookConsultation={(contact) => {
          setHealthOpen(false)
          window.dispatchEvent(new CustomEvent('omni:open-discovery', {
            detail: { contact: contact || {} },
          }))
        }}
      />
    </>
  )
}
