const partnerLogos = [
  { title: 'Partner 1', image: '/partners/partner (1).jpg' },
  { title: 'Partner 2', image: '/partners/partner (2).png' },
  { title: 'Partner 3', image: '/partners/partner (3).png' },
  { title: 'Partner 4', image: '/partners/partner (4).png' },
  { title: 'Partner 5', image: '/partners/partner (5).png' },
  { title: 'Partner 6', image: '/partners/partner (6).png' },
  { title: 'ISO 27001', image: '/trust/iso-27001.png' },
  { title: 'PCI SAQ-D', image: '/trust/pci-saq-d.svg' },
]

export function SolutionStats({ stats }) {
  if (!stats?.length) return null

  return (
    <dl className="solution-stats">
      {stats.map(([value, label]) => (
        <div key={label}>
          <dt>{value}</dt>
          <dd>{label}</dd>
        </div>
      ))}
    </dl>
  )
}

export function SolutionTrust({ quote }) {
  return (
    <div className="solution-trust">
      {quote ? (
        <figure>
          <blockquote>“{quote.text}”</blockquote>
          {quote.attribution ? <figcaption>{quote.attribution}</figcaption> : null}
        </figure>
      ) : null}

      <div className="solution-trust__logos">
        <p>Trusted delivery</p>
        <div>
          {partnerLogos.map((logo) => (
            <img alt={logo.title} key={logo.title} src={logo.image} />
          ))}
        </div>
      </div>
    </div>
  )
}
