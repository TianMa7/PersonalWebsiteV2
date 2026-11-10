import headshot from '../assets/UWFEFaceshot.jpg';
import waterlooLogoLight from '../assets/WaterlooLogoLight.webp';
import waterlooLogoReversed from '../assets/WaterlooLogoReversed.webp';
import RadarChart from '../components/RadarChart.tsx';
import "./Hero.css";

function ArrowDownIcon() {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
                d="M8 3.25v9.5m0 0 4-4m-4 4-4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function Hero() {
    return (
      <section className="hero" id="home">
          {/*<h1 className="hero__title">Tian's Profile</h1>*/}

          <div className="hero__content">
              <div className="hero__images">
                <img className="hero__headshot" src={headshot} alt="Portrait of Tian Ma"/>
                <picture className="hero__logo">
                  <source
                    media="(prefers-color-scheme: dark)"
                    srcSet={waterlooLogoReversed}
                  />
                  <img
                    className="hero__waterlooLogo"
                    src={waterlooLogoLight}
                    alt="University of Waterloo"
                  />
                </picture>
              </div>

              <div className="hero__description">
                  <h1 className="hero__heading">
                      <span className="hero__name">Tian Ma</span>{' '}
                      <span className="hero__headline">I make ideas real.</span>
                  </h1>

                  <p className="hero__credential">
                      <span className="hero__credential-part">
                          BASc Mechatronics ’30
                      </span>
                      <span className="hero__credential-part">
                          University of Waterloo
                      </span>
                  </p>

                  <p className="hero__lede">
                      <span className="hero__lede-line">
                          Sometimes they work.
                      </span>
                      <span className="hero__lede-line">
                          Sometimes they break.
                      </span>
                      <span className="hero__lede-turn">
                          Either way, I learn, rebuild, and make them better.
                      </span>
                  </p>

                  <div className="hero__actions">
                      <span className="hero__status">
                          <span
                              className="hero__status-dot"
                              aria-hidden="true"
                          />
                          Seeking Summer 2027 internships
                      </span>

                      <a href="#experience" className="hero__cta">
                          See what I’ve built
                          <ArrowDownIcon />
                      </a>
                  </div>
              </div>

              <div className="hero__stats">
                  <RadarChart />
              </div>
          </div>
      </section>
    );
}

export default Hero;
