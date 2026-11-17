import SectionHead from '@/components/layout/SectionHead'
import SolutionHero from '@/features/solutions/components/SolutionHero'
import SolutionOverview from '@/features/solutions/components/SolutionOverview'
import SolutionOutcomes from '@/features/solutions/components/SolutionOutcomes'
import SolutionSectionNav from '@/features/solutions/components/SolutionSectionNav'
import { SolutionClosingCta } from '@/features/solutions/components/SolutionSections'

const micrositeBase = 'https://omnicontact.biz/project_ignite'

const landingNav = [
  { href: '#overview', label: 'Overview' },
  { href: '#impact', label: 'Impact' },
  { href: '#partners', label: 'Partners' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#news', label: 'News' },
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
  ['Digital Literacy', 'We equip participants with essential technology skills to navigate the digital world confidently.'],
  ['Entrepreneurship', 'Training in digital business models, online marketing, and e-commerce so skills can become income.'],
  ['Leadership Development', 'Leadership skills that help women drive digital transformation in their communities.'],
  ['Mentorship & Networking', 'Mentors and professional networks that keep participants connected after the classroom.'],
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
    text: 'Program remarks focused on inclusion, participation, and expanding opportunity for women and youth.',
  },
]

export default function ProjectIgniteLanding({ page }) {
  return (
    <>
      <SolutionHero
        breadcrumbs={[
          { label: 'About', href: '/about' },
          { label: 'Project Ignite' },
        ]}
        image={galleryImages[0].src}
        subtitle={`${page.subtitle} Through digital literacy, entrepreneurship, leadership, and mentorship, the program helps turn skills access into real opportunity.`}
        title="Igniting Digital Dreams"
      />

      <SolutionSectionNav
        assessmentContext={page.assessmentContext}
        assessmentGoal={page.assessmentGoal}
        ctaLabel={page.navCta}
        links={landingNav}
        title="Project Ignite"
      />

      <section className="solution-anchor sx-band sx-band--soft" id="overview">
        <div className="site-container">
          <SolutionOverview
            body="Many women and young people face barriers to digital access, skills, mentorship, and market participation. Project Ignite responds with practical learning pathways and community-centred support."
            heading="Bridging the digital divide for women and youth"
            headingLabel="The challenge"
            image={galleryImages[1].src}
            items={[
              {
                title: 'The opportunity',
                detail:
                  'Digital skills can open access to education, employment, entrepreneurship, and leadership. The initiative helps participants move from exposure to confidence, and from confidence to opportunity.',
                label: 'Focus 01',
              },
              {
                title: 'Real transformation',
                detail:
                  'Project Ignite is designed as a movement for inclusive digital growth, connecting people, partners, and practical pathways that help women and youth lead in a changing economy.',
                label: 'Focus 02',
              },
              ...page.highlights.map(([title, detail], index) => ({
                title,
                detail,
                label: `Focus ${String(index + 3).padStart(2, '0')}`,
              })),
            ]}
          />
        </div>
      </section>

      <section className="solution-anchor sx-band" id="impact">
        <div className="site-container">
          <SolutionOutcomes
            eyebrow="Impact models"
            heading="Four ways Project Ignite creates momentum"
            image={galleryImages[2].src}
            items={impactModels}
          />
        </div>
      </section>

      <section className="solution-anchor sx-band sx-band--soft" id="partners">
        <div className="site-container">
          <SectionHead
           
            copy="Project Ignite brings together organizations committed to women’s empowerment, youth opportunity, financial inclusion, and digital skills development."
            eyebrow="Partnership"
          >
            Collaboration powers the movement
          </SectionHead>
          <div className="ignite-partners">
            {partnerLogos.map((logo) => (
              <div className="ignite-partners__logo" key={logo.src}>
                <img alt={logo.alt} src={logo.src} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="solution-anchor sx-band" id="gallery">
        <div className="site-container">
          <SectionHead
           
            copy="Moments from the Project Ignite launch and community."
            eyebrow="Gallery"
          >
            The program in pictures
          </SectionHead>
          <div className="ignite-gallery">
            {galleryImages.map((image, index) => (
              <figure className={index === 0 || index === 3 ? 'ignite-gallery__wide' : undefined} key={image.src}>
                <img alt={image.alt} src={image.src} />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="solution-anchor sx-band sx-band--soft" id="news">
        <div className="site-container">
          <SectionHead
           
            copy="Continue into the original Project Ignite articles for deeper context."
            eyebrow="News"
          >
            Stories and launch updates
          </SectionHead>
          <div className="sx-cards">
            {newsItems.map((item) => (
              <a className="sx-card sx-card--link" href={item.href} key={item.href} rel="noreferrer" target="_blank">
                <p className="sx-label">Article</p>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <SolutionClosingCta
        page={{
          ...page,
          cta: {
            ...page.cta,
            heading: page.cta.heading,
            text: `${page.cta.text} Write to info@omnicontact.co.zw or call +263 8677 004 004.`,
          },
        }}
      />
    </>
  )
}
