import LandingPage from '@/features/landing/LandingPage'
import { buildCategoryLanding } from '@/features/landing/buildLanding'

export default function SolutionCategoryPage({ page, breadcrumbs, cardLabel = 'Service' }) {
  return <LandingPage config={buildCategoryLanding(page, { breadcrumbs, cardLabel })} />
}
