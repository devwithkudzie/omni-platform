import SolutionCategoryPage from '@/features/solutions/components/SolutionCategoryPage'

export default function IndustryIndexPage({ page }) {
  return (
    <SolutionCategoryPage
      breadcrumbs={[{ label: 'Industries' }]}
      cardLabel="Industry"
      page={page}
    />
  )
}
