import Link from 'next/link'

export default function AfricaBeyondCallout() {
  return (
    <section className="africa-beyond">
      <div className="africa-beyond__media" aria-hidden="true">
        <img src="/home/visuals/africa-beyond.png" alt="" />
      </div>
      <div className="site-container">
        <div className="africa-beyond__copy">
          <p className="reference-section__eyebrow africa-beyond__eyebrow">
            <span aria-hidden="true" />
            Africa and beyond
          </p>
          <h2>Built in Africa. Delivered wherever your customers are.</h2>
          <p>
            Multilingual teams, secure operations, and AI-enabled delivery supporting enterprises
            across Africa and international markets.
          </p>
          <div className="africa-beyond__actions">
            <Link className="reference-button reference-button--primary" href="/about/who-we-are">
              About OmniContact <span aria-hidden="true">→</span>
            </Link>
            <Link className="reference-button reference-button--ghost" href="/site-tour">
              Take a site tour <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
