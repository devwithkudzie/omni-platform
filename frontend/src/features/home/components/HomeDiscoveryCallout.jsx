import AssessmentModalButton from '@/components/assessment/AssessmentModalButton'

export default function HomeDiscoveryCallout() {
  return (
    <section className="home-discovery-callout" aria-label="Book a discovery call">
      <div className="site-container home-discovery-callout__inner">
        <p>Talk through your CX operations with us.</p>
        <AssessmentModalButton
          className="home-discovery-callout__cta"
          context={{
            category: 'OmniContact',
            title: 'Discovery Session',
            objective: 'Map the right OmniContact solution',
          }}
          step="meeting"
        >
          Book a discovery call
        </AssessmentModalButton>
      </div>
    </section>
  )
}
