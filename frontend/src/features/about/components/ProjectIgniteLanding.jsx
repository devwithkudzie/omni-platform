'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const micrositeBase = 'https://omnicontact.biz/project_ignite'

const landingNav = [
  ['About', 'ignite-about'],
  ['Impact', 'ignite-impact'],
  ['Partners', 'ignite-partners'],
  ['Gallery', 'ignite-gallery'],
  ['News', 'ignite-news'],
]

const galleryImages = [
  { src: '/ignite/gallery/ignite-hero.jpg', alt: 'Project Ignite program lead in OmniContact branded uniform' },
  { src: '/ignite/gallery/ignite-community.jpg', alt: 'OmniContact community impact gathering' },
  { src: '/ignite/gallery/ignite-impact.jpg', alt: 'Community impact moment connected to Project Ignite' },
  { src: '/ignite/gallery/ignite-impact-2.jpg', alt: 'Project Ignite community support and outreach' },
  { src: '/ignite/gallery/ignite-associates.jpg', alt: 'OmniContact associates supporting customer and digital operations' },
  { src: '/ignite/gallery/ignite-education.jpg', alt: 'Education and digital learning environment' },
]

const partnerLogos = [
  { src: '/ignite/partners/partner-01.jpg', alt: 'Project Ignite partner logo' },
  { src: '/ignite/partners/partner-02.png', alt: 'Project Ignite partner logo' },
  { src: '/ignite/partners/partner-03.png', alt: 'Project Ignite partner logo' },
  { src: '/ignite/partners/partner-04.png', alt: 'Project Ignite partner logo' },
  { src: '/ignite/partners/partner-05.png', alt: 'Project Ignite partner logo' },
]

const impactModels = [
  ['Digital Literacy', 'We will equip participants with essential technology skills to navigate the digital world confidently.'],
  ['Entrepreneurship', 'We will provide training in digital business models, online marketing, and e-commerce.'],
  ['Leadership Development', 'We will empower women with leadership skills to drive digital transformation in their communities.'],
  ['Mentorship & Networking', 'We will connect participants with mentors and create networking opportunities with tech professionals.'],
]

const newsItems = [
  {
    title: 'Press Release: Project Ignite Launch',
    href: `${micrositeBase}/articles/press-release-project-ignite.html`,
    text: 'Project Ignite officially launched in Harare on 6 June 2025, bringing together partners committed to digital empowerment.',
  },
  {
    title: 'UN Women Representative Remarks',
    href: `${micrositeBase}/articles/un-women-representative-remarks.html`,
    text: 'Program remarks focused on inclusion, participation, and the need to expand opportunity for women and youth.',
  },
]

function FlameMark() {
  return (
    <span className="relative grid size-10 place-items-center rounded-full bg-omni-blue shadow-[0_10px_24px_rgba(58,80,159,.28)]">
      <span className="absolute size-5 rounded-full bg-omni-yellow" />
      <span className="relative block h-6 w-4 rounded-full bg-white [clip-path:polygon(50%_0,82%_35%,70%_100%,30%_100%,18%_35%)]" />
    </span>
  )
}

function IgniteSectionTitle({ eyebrow, title, text, light = false }) {
  return (
    <div className="mb-8 max-w-[820px]">
      <p className={`mb-3 font-black uppercase tracking-[.1em] ${light ? 'text-omni-yellow' : 'text-omni-yellow'}`}>{eyebrow}</p>
      <h2 className={`m-0 text-[clamp(2rem,2.8vw,3.6rem)] font-black leading-[1.04] ${light ? 'text-white' : 'text-omni-blue'}`}>{title}</h2>
      {text ? <p className={`mt-4 text-lg leading-[1.7] ${light ? 'text-white/82' : 'text-[#526179]'}`}>{text}</p> : null}
    </div>
  )
}

export default function ProjectIgniteLanding({ page }) {
  const [activeId, setActiveId] = useState('ignite-about')
  const [isDocked, setIsDocked] = useState(false)

  useEffect(() => {
    function syncChromeHeight() {
      const chrome = document.querySelector('.site-chrome')
      document.documentElement.style.setProperty('--site-chrome-height', `${chrome?.offsetHeight || 110}px`)
    }

    function updateNavState() {
      syncChromeHeight()
      const hero = document.getElementById('ignite-home')
      const nextDocked = Boolean(hero && hero.getBoundingClientRect().bottom <= 0)
      setIsDocked(nextDocked)
      document.body.classList.toggle('project-ignite-nav-docked', nextDocked)

      const current = landingNav
        .map(([, id]) => {
          const element = document.getElementById(id)
          return element ? [id, Math.abs(element.getBoundingClientRect().top - 96)] : null
        })
        .filter(Boolean)
        .sort((a, b) => a[1] - b[1])[0]

      if (current) setActiveId(current[0])
    }

    syncChromeHeight()
    updateNavState()
    window.addEventListener('scroll', updateNavState, { passive: true })
    window.addEventListener('resize', syncChromeHeight)

    return () => {
      document.body.classList.remove('project-ignite-nav-docked')
      document.documentElement.style.removeProperty('--site-chrome-height')
      window.removeEventListener('scroll', updateNavState)
      window.removeEventListener('resize', syncChromeHeight)
    }
  }, [])

  return (
    <div className="bg-omni-soft text-omni-ink">
      <section id="ignite-home" className="relative isolate h-[calc(100vh-var(--site-chrome-height,110px))] min-h-[560px] max-h-[860px] overflow-hidden bg-omni-blue text-white max-lg:h-auto max-lg:min-h-[calc(100vh-var(--site-chrome-height,102px))]">
        <div className="absolute inset-0">
          <img className="h-full w-full object-cover opacity-45" src={galleryImages[0].src} alt="" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(254,201,53,.32),transparent_28%),linear-gradient(104deg,rgba(58,80,159,.98)_0%,rgba(58,80,159,.92)_48%,rgba(68,118,185,.74)_100%)]" />
        </div>

        <div className="site-container relative grid h-full items-center gap-8 py-[clamp(38px,5vw,70px)] lg:grid-cols-[1.02fr_.98fr] max-lg:min-h-[inherit]">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <FlameMark />
              <span className="text-lg font-black uppercase tracking-[.14em] text-omni-yellow">Project Ignite</span>
            </div>
            <h1 className="m-0 text-[clamp(2.7rem,5.2vw,6rem)] font-black leading-[.98] text-white">
              Igniting Digital Dreams
            </h1>
            <p className="mt-6 max-w-[760px] border-l-[4px] border-omni-yellow pl-5 text-[clamp(1.02rem,.45vw+1rem,1.32rem)] leading-[1.62] text-white/90">
              {page.subtitle} Through digital literacy, entrepreneurship, leadership development, and mentorship, the program helps turn skills access into real opportunity.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="grid min-h-[48px] place-items-center rounded-md bg-omni-yellow px-6 py-3 font-black text-omni-ink transition hover:bg-white" href="#ignite-contact">
                Get Involved
              </a>
              <a className="grid min-h-[48px] place-items-center rounded-md border-2 border-white/70 px-6 py-3 font-black text-white transition hover:border-omni-yellow hover:bg-white/10" href="#ignite-gallery">
                View Gallery
              </a>
            </div>
          </div>

          <div className="relative hidden h-[min(56vh,520px)] min-h-[390px] lg:block">
            <img className="absolute right-0 top-0 h-[58%] w-[62%] rounded-[28px] object-cover shadow-[0_30px_70px_rgba(0,0,0,.32)]" src={galleryImages[1].src} alt={galleryImages[1].alt} />
            <img className="absolute bottom-0 left-0 h-[56%] w-[66%] rounded-[28px] border-[10px] border-omni-soft object-cover shadow-[0_30px_70px_rgba(0,0,0,.32)]" src={galleryImages[2].src} alt={galleryImages[2].alt} />
            <div className="absolute bottom-[18%] right-[10%] max-w-[260px] rounded-[28px] bg-white p-5 text-omni-ink shadow-[0_22px_54px_rgba(0,0,0,.24)]">
              <p className="m-0 text-4xl font-black text-omni-blue">6 Jun</p>
              <p className="mt-1 font-black">Launched in Harare, Zimbabwe</p>
            </div>
          </div>
        </div>
      </section>

      <nav
        className={`sticky top-0 border-y border-white/15 bg-omni-blue/95 text-white backdrop-blur ${isDocked ? 'z-[1001] shadow-[0_16px_36px_rgba(25,49,118,.18)]' : 'z-[45]'}`}
        aria-label="Project Ignite page navigation"
      >
        <div className="site-container flex min-h-[68px] items-center gap-4 overflow-x-auto">
          <Link className="mr-auto flex shrink-0 items-center gap-2 font-black text-white" href="/about/project-ignite">
            <FlameMark />
            <span>Project Ignite</span>
          </Link>
          {landingNav.map(([label, id]) => (
            <a
              className={`shrink-0 rounded-md px-3.5 py-2 text-sm font-black transition ${activeId === id ? 'bg-omni-yellow text-omni-ink' : 'text-white/86 hover:bg-white/12 hover:text-white'}`}
              href={`#${id}`}
              key={id}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      <section id="ignite-about" className="scroll-mt-24 bg-omni-soft py-[clamp(58px,7vw,96px)]">
        <div className="site-container grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <IgniteSectionTitle
            eyebrow="The Challenge"
            title="Bridging the digital divide for women and youth."
            text="Many women and young people face barriers to digital access, skills, mentorship, and market participation. Project Ignite responds with practical learning pathways and community-centred support."
          />
          <div className="grid gap-4">
            <article className="rounded-2xl bg-white p-6 shadow-[0_18px_44px_rgba(25,49,118,.09)]">
              <h3 className="m-0 text-2xl font-black text-omni-blue">The Opportunity</h3>
              <p className="mt-4 leading-[1.75] text-[#526179]">
                Digital skills can open access to education, employment, entrepreneurship, and leadership. The initiative helps participants move from exposure to confidence, and from confidence to opportunity.
              </p>
            </article>
            <article className="rounded-2xl bg-omni-blue p-6 text-white shadow-[0_18px_44px_rgba(25,49,118,.18)]">
              <h3 className="m-0 text-2xl font-black text-white">Real Transformation</h3>
              <p className="mt-4 leading-[1.75] text-white/82">
                Project Ignite is designed as a movement for inclusive digital growth, connecting people, partners, and practical pathways that help women and youth lead in a changing economy.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="ignite-impact" className="scroll-mt-24 bg-white py-[clamp(58px,7vw,96px)]">
        <div className="site-container">
          <IgniteSectionTitle
            eyebrow="Impact Models"
            title="Four ways Project Ignite creates momentum."
            text="The microsite frames impact around digital literacy, entrepreneurship, leadership, and mentorship."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {impactModels.map(([title, text], index) => (
              <article className="rounded-2xl border border-[#d8e3f7] bg-omni-soft p-6" key={title}>
                <div className="mb-5 grid size-12 place-items-center rounded-full bg-omni-blue text-lg font-black text-white">{index + 1}</div>
                <h3 className="m-0 text-xl font-black text-omni-blue">{title}</h3>
                <p className="mt-3 leading-[1.65] text-[#526179]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="ignite-partners" className="scroll-mt-24 bg-omni-blue py-[clamp(58px,7vw,96px)] text-white">
        <div className="site-container">
          <IgniteSectionTitle
            eyebrow="Partnership"
            title="Collaboration powers the movement."
            text="Project Ignite brings together organizations committed to women’s empowerment, youth opportunity, financial inclusion, and digital skills development."
            light
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {partnerLogos.map((logo) => (
              <div className="grid min-h-[130px] place-items-center rounded-2xl bg-white p-5" key={logo.alt}>
                <img className="max-h-20 w-auto object-contain" src={logo.src} alt={logo.alt} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ignite-gallery" className="scroll-mt-24 bg-omni-soft py-[clamp(58px,7vw,96px)]">
        <div className="site-container">
          <IgniteSectionTitle
            eyebrow="Gallery"
            title="Moments from the Project Ignite launch and community."
            text="The gallery uses images from the Project Ignite microsite so the new page carries the same visual story."
          />
          <div className="grid auto-rows-[220px] gap-4 md:grid-cols-3 lg:auto-rows-[260px]">
            {galleryImages.map((image, index) => (
              <figure className={`${index === 0 || index === 3 ? 'md:col-span-2' : ''} overflow-hidden rounded-3xl bg-white shadow-[0_18px_44px_rgba(25,49,118,.1)]`} key={image.src}>
                <img className="h-full w-full object-cover transition duration-500 hover:scale-105" src={image.src} alt={image.alt} />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="ignite-news" className="scroll-mt-24 bg-white py-[clamp(58px,7vw,96px)]">
        <div className="site-container grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <IgniteSectionTitle
            eyebrow="News"
            title="Stories and launch updates."
            text="Visitors can continue into the original Project Ignite articles for deeper context."
          />
          <div className="grid gap-4">
            {newsItems.map((item) => (
              <a className="group block rounded-2xl border border-[#d8e3f7] bg-omni-soft p-6 transition hover:-translate-y-0.5 hover:border-omni-blue" href={item.href} key={item.href} rel="noreferrer" target="_blank">
                <h3 className="m-0 text-2xl font-black text-omni-blue group-hover:text-omni-primary">{item.title}</h3>
                <p className="mt-3 leading-[1.7] text-[#526179]">{item.text}</p>
                <span className="mt-4 inline-flex font-black text-omni-blue">Read article →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="ignite-contact" className="scroll-mt-24 bg-omni-blue py-[clamp(58px,7vw,96px)]">
        <div className="site-container grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="mb-3 font-black uppercase tracking-[.1em] text-omni-yellow">Contact</p>
            <h2 className="m-0 text-[clamp(2.2rem,3.4vw,4.3rem)] font-black leading-[1.02] text-white">
              Join Project Ignite and get involved.
            </h2>
            <p className="mt-4 max-w-[720px] text-lg leading-[1.7] text-white/82">
              Support digital learning, mentorship, community access, and inclusive leadership pathways for women and youth.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,.18)]">
            <div className="grid gap-4">
              <a className="rounded-2xl bg-omni-yellow px-5 py-4 font-black text-omni-ink" href="mailto:info@omnicontact.co.zw">info@omnicontact.co.zw</a>
              <a className="rounded-2xl bg-omni-soft px-5 py-4 font-black text-omni-blue" href="tel:+2638677004004">+263 8677 004 004</a>
              <p className="m-0 rounded-2xl bg-omni-soft px-5 py-4 font-black text-omni-blue">Harare, Zimbabwe</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
