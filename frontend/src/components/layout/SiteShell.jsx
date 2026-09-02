import Footer from './Footer'
import DiscoveryModalProvider from './DiscoveryModalProvider'
import AssessmentModalProvider from './AssessmentModalProvider'
import AssessmentCallout from './AssessmentCallout'
import Header from '@/components/navigation/Header'
import MobileNav from '@/components/navigation/MobileNav'

export default function SiteShell({ children, chrome }) {
  return (
    <>
      <AssessmentCallout />
      <div className={chrome === 'static' ? 'site-chrome site-chrome--static' : 'site-chrome'}>
        <Header />
        <MobileNav />
      </div>
      {children}
      <Footer />
      <AssessmentModalProvider />
      <DiscoveryModalProvider />
    </>
  )
}
