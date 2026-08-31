import SolutionChildPage from '@/features/solutions/components/SolutionChildPage'
import { industryPages } from '@/features/industries/data/industries'

export default function IndustryPage({ page }) {
  const related = Object.values(industryPages)
    .filter((item) => item.slug !== page.slug)
    .slice(0, 3)
    .map((item) => ({
      title: item.title,
      href: item.href,
    }))

  return (
    <SolutionChildPage
      breadcrumbs={[
        { label: 'Industries', href: '/industries' },
        { label: page.title },
      ]}
      page={{ ...page, focusLabel: 'Capability' }}
      related={related}
      relatedEyebrow="Related industries"
      relatedHeading="Other sectors we support"
      relatedLabel="Related industry"
    />
  )
}
