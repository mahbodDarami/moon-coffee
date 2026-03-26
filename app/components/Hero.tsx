export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        <video autoPlay muted loop playsInline preload="metadata">
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />
      </div>

      <div className="hero-content">
        <p className="hero-eyebrow">Chicago &mdash; Est. 2009</p>
        <h1 className="hero-heading">
          Every cup<br /><em>tells a story.</em>
        </h1>
        <p className="hero-sub">
          Specialty coffee. Sourced with care. Served with intention.
        </p>
        <a href="#quality" className="hero-cta">Discover Our Craft</a>
      </div>

      <div className="hero-scroll-hint">
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}
