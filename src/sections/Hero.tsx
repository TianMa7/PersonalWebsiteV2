import headshot from '../assets/UWFEFaceshot.jpg';
import waterlooLogo from '../assets/waterlooLogo.png';
import RadarChart from '../components/RadarChart.tsx';
import "./Hero.css";

function Hero() {
    return (
      <section className="hero" id="home">
          {/*<h1 className="hero__title">Tian's Profile</h1>*/}

          <div className="hero__content">
              <div className="hero__images">
                <img className="hero__headshot" src={headshot} alt="Tian's image"/>
                  <img className="hero__waterlooLogo" src={waterlooLogo} alt="Waterloo Logo"/>
              </div>

              <div className="hero__stats">
                  <RadarChart />
              </div>

              <div className="hero__description">
                  <h2>Tian Ma</h2>
                  <p>This is a description of my character. make it breif!</p>
              </div>
          </div>
      </section>
    );
}

export default Hero;