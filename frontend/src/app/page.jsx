import SiteShell from '@/components/layout/SiteShell'
import HomeHero from '@/features/home/components/HomeHero'
import HomeSections from '@/features/home/components/HomeSections'

export default function HomePage() {
  return (
    <SiteShell>
      <main className="home-theme">
        <HomeHero />
        <HomeSections />
      </main>
    </SiteShell>
  )
}
