'use client'

import { useState } from 'react'
import SectionHead from '@/components/layout/SectionHead'

const tourTabs = [
  {
    id: 'dashboard',
    label: 'Administrator Dashboard',
    title: 'See the school in one operating view.',
    body: 'Track student records, attendance, fees, communications, and reports without switching between spreadsheets or disconnected tools.',
    metric: 'Live visibility',
  },
  {
    id: 'records',
    label: 'Academic Records',
    title: 'Keep academic history structured and accessible.',
    body: 'Manage student profiles, classes, subjects, marks, report cards, and year-to-year progression from a single platform.',
    metric: 'Cleaner records',
  },
  {
    id: 'fees',
    label: 'Fee Management',
    title: 'Give finance teams control of payments and balances.',
    body: 'Monitor invoices, payments, balances, reconciliations, and fee communication with fewer manual checks.',
    metric: 'Faster finance',
  },
  {
    id: 'portal',
    label: 'Parent Portal',
    title: 'Create a better parent communication experience.',
    body: 'Share updates, balances, attendance signals, report cards, and announcements through a more connected school experience.',
    metric: 'Better engagement',
  },
]

export function AramsDashboardMockup({ activeTab = 'dashboard' }) {
  const tab = tourTabs.find((item) => item.id === activeTab) || tourTabs[0]

  return (
    <div className="arams-mockup">
      <div className="arams-mockup__bar">
        <div>
          <p>ARAMS</p>
          <strong>{tab.label}</strong>
        </div>
        <span>{tab.metric}</span>
      </div>
      <div className="arams-mockup__grid">
        <aside>
          {['Students', 'Finance', 'Attendance', 'Reports'].map((item, index) => (
            <div key={item}>
              <p>{item}</p>
              <strong>{index === 0 ? '1,842' : index === 1 ? '92%' : index === 2 ? '97%' : '128'}</strong>
            </div>
          ))}
        </aside>
        <div className="arams-mockup__panel">
          <p>{tab.title}</p>
          <div>
            {[78, 92, 64, 86].map((width) => (
              <span key={width}>
                <span style={{ width: `${width}%` }} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AramsPlatformTour() {
  const [activeTab, setActiveTab] = useState(tourTabs[0].id)
  const current = tourTabs.find((tab) => tab.id === activeTab) || tourTabs[0]

  return (
    <section className="product-tour">
      <div className="site-container">
        <div className="product-tour__intro">
          <SectionHead
            className="section-head--on-dark"
            copy="Switch between the views school teams actually use — administration, records, fees, and parent communication."
            eyebrow="Platform"
          >
            Explore how ARAMS works
          </SectionHead>
        </div>
        <div className="product-tour__layout">
          <div className="product-tour__tabs">
            {tourTabs.map((tab) => (
              <button
                className={activeTab === tab.id ? 'is-active' : undefined}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <span className="outcome-card__bar" aria-hidden="true" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="product-tour__stage">
            <AramsDashboardMockup activeTab={activeTab} />
            <p>{current.body}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
