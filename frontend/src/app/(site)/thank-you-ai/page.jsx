import SiteShell from '@/components/layout/SiteShell'
import ThankYouPage from '@/features/thank-you/ThankYouPage'
import { thankYouMetadata } from '@/features/thank-you/thankYouPages'

export const metadata = thankYouMetadata('ai')

export default function ThankYou() {
  return (
    <SiteShell>
      <main>
        <ThankYouPage pageKey="ai" />
      </main>
    </SiteShell>
  )
}
