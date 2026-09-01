export default function SectionHead({ eyebrow, children, className = '', copy }) {
  return (
    <>
      <div className={['reference-section__head', className].filter(Boolean).join(' ')}>
        {eyebrow ? (
          <p className="reference-section__eyebrow">
            <span aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}
        <h2>{children}</h2>
      </div>
      {copy ? <p className="section-head__copy">{copy}</p> : null}
    </>
  )
}
