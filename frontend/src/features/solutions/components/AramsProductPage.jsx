import TransformationPath from './TransformationPath'
import SolutionHero from './SolutionHero'
import SolutionFaq from './SolutionFaq'
import SolutionOutcomes from './SolutionOutcomes'
import SolutionOverview from './SolutionOverview'
import SolutionSectionNav from './SolutionSectionNav'
import { SolutionClosingCta, SolutionEngagement, SolutionRelated } from './SolutionSections'
import { solutionChildPages } from '@/features/solutions/data/solutions'
import AramsPlatformTour, { AramsDashboardMockup } from './AramsPlatformTour'

const modules = [
  ['Academic Management', 'Classes, subjects, marks, report cards, timetables, and academic progression.'],
  ['Student Records', 'Centralized student profiles, documents, guardians, enrollment status, and history.'],
  ['Attendance', 'Daily attendance, exceptions, follow-up signals, and visibility for administrators.'],
  ['Financial Management', 'Fees, payments, balances, statements, and finance reporting routines.'],
  ['Communication', 'Announcements, messaging, notifications, and parent-facing communication workflows.'],
  ['Administration', 'Staff, classes, governance records, permissions, and school operating controls.'],
]

const engagement = [
  ['Discover', 'Map school structure, roles, fee model, academic year, and the reports leadership already uses.'],
  ['Configure', 'Shape ARAMS around classes, fees, communication, permissions, and your existing records.'],
  ['Go live', 'Migrate data, train staff, and launch with support on the floor — not a handover and silence.'],
  ['Support', 'Ongoing help, reporting, and iteration after go-live so the platform stays the system of record.'],
]

const faqs = [
  ['Who is ARAMS built for?', 'School owners, headmasters, administrators, finance teams, ICT teams, teachers, and school boards that need a connected operating system.'],
  ['Can ARAMS be configured for our school?', 'Yes. The platform is shaped around your school structure, roles, reporting needs, fee model, and academic workflows.'],
  ['Do you support implementation?', 'Yes. OmniContact supports discovery, configuration, data migration, user training, go-live, and post-launch support.'],
  ['Is pricing fixed?', 'Pricing depends on school size, modules, migration needs, and support requirements. A product demo is the right next step.'],
]

export default function AramsProductPage({ page }) {
  const related = Object.values(solutionChildPages['enterprise-platforms'] || {})
    .filter((item) => item.slug && item.slug !== 'arams')
    .slice(0, 3)
    .map((item) => ({
      title: item.title,
      href: item.href,
    }))

  return (
    <>
      <SolutionHero
        breadcrumbs={[
          { label: 'Solutions', href: '/solutions/ai-technology-solutions' },
          { label: page.parentTitle, href: page.parentHref },
          { label: 'ARAMS' },
        ]}
        image={page.image}
        subtitle="Manage academics, finance, communication, and administration from one secure platform designed for modern schools."
        title="Modern school management starts here"
      />

      <SolutionSectionNav
        assessmentContext={page.assessmentContext}
        assessmentGoal={page.assessmentGoal}
        ctaLabel="Book a demo"
        title="ARAMS"
      />

      <section className="solution-anchor solution-group solution-group--navy" id="overview">
        <div className="site-container">
          <SolutionOverview
            body="ARAMS replaces fragmented spreadsheets, paper records, disconnected finance routines, and scattered communication with a single operating system for modern school administration."
            featureLabel="Product overview"
            heading={page.intro.heading}
            items={modules.map(([title, detail]) => ({
              title,
              detail,
              label: 'Module',
            }))}
            media={<AramsDashboardMockup />}
            quote={page.quote}
          />
        </div>
      </section>

      <section className="solution-anchor solution-group solution-group--dark" id="outcomes">
        <div className="site-container">
          <SolutionOutcomes
            heading="Outcomes we support"
            image={page.secondaryImage || page.image}
            items={page.outcomes}
            stats={page.stats}
          />
        </div>
        <SolutionRelated
          cardLabel="Related platform"
          eyebrow="Related platforms"
          heading="Other systems teams run with us"
          items={related}
        />
      </section>

      <div className="solution-anchor" id="how-it-works">
        <SolutionEngagement
          copy="Discovery, configuration, migration, training, and support — scoped to your school, not a generic software rollout."
          heading="How we implement ARAMS"
          items={engagement}
        />
        <AramsPlatformTour />
        <TransformationPath
          assessmentContext={page.assessmentContext}
          assessmentGoal={page.assessmentGoal}
          illustration={page.illustration}
        />
        <SolutionFaq items={faqs} />
      </div>

      <SolutionClosingCta
        page={{
          ...page,
          cta: {
            heading: 'Request a demo and pricing for your school',
            text: 'Pricing depends on school size, modules, migration needs, and support model. See ARAMS in context first.',
          },
        }}
      />
    </>
  )
}
