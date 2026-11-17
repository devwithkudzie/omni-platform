import LandingPage from '@/features/landing/LandingPage'
import { buildServiceLanding } from '@/features/landing/buildLanding'
import { customLandings } from '@/features/landing/custom'

export default function SolutionChildPage({
  page,
  breadcrumbs,
  related,
  relatedEyebrow,
  relatedHeading,
  relatedLabel,
}) {
  const buildCustom = customLandings[page.slug]
  const config = buildCustom
    ? buildCustom(page)
    : buildServiceLanding(page, { breadcrumbs, related, relatedEyebrow, relatedHeading, relatedLabel })

  return <LandingPage config={config} />
}
