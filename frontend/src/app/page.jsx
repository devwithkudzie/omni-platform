import '@/styles/home.css'
import SiteShell from '@/components/layout/SiteShell'
import HomeHero from '@/features/home/components/HomeHero'
import HomeSections from '@/features/home/components/HomeSections'

export const metadata = {
  title: 'Yamurai OmniContact | AI-Powered Customer Experience & BPO',
  description:
    'Transform customer experience and scale operations with Yamurai OmniContact. AI-powered CX, BPO, marketing and data services with a human touch.',
}

export default function HomePage() {
  return (
    <SiteShell>
      <main className="hx">
        <HomeHero />
        <HomeSections />
      </main>
    </SiteShell>
  )
}
