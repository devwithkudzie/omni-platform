export default function SectionHead({ eyebrow, children, className = '', copy, align }) {
  return (
    <div className={['sx-head', align === 'center' ? 'sx-head--center' : '', className].filter(Boolean).join(' ')}>
      {eyebrow ? <p className="hx-eyebrow">{eyebrow}</p> : null}
      <h2>{children}</h2>
      {copy ? <p className="sx-head__copy">{copy}</p> : null}
    </div>
  )
}
