import headshot from '../assets/UWFEFaceshot.jpg';
import waterlooLogoLight from '../assets/WaterlooLogoLight.webp';
import waterlooLogoReversed from '../assets/WaterlooLogoReversed.webp';
import RadarChart from '../components/RadarChart.tsx';
import "./Hero.css";

function Hero() {
    return (
      <section className="hero" id="home">
          {/*<h1 className="hero__title">Tian's Profile</h1>*/}

          <div className="hero__content">
              <div className="hero__images">
                <img className="hero__headshot" src={headshot} alt="Tian's image"/>
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
                  <h2>Tian Ma</h2>
                  <p>This is a description of my character. make it breif!</p>
              </div>

              <div className="hero__stats">
                  <RadarChart />
              </div>
          </div>
      </section>
    );
}

export default Hero;
