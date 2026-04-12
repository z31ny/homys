import React from 'react';
import './AboutHero.css';
import img1 from '../imgs/img1.png';
import img2 from '../imgs/img2.png';
import loggo from '../imgs/loggo.png';

const AboutHero = () => {
  return (
    <section className="about-section">
      <div className="about-container">
        
        <div className="img-wrapper left-img">
          <img src={img1} alt="Leisure" loading="lazy" />
        </div>

        <div className="about-content">
          <img src={loggo} alt="HO Logo" className="ho-logo" />
          <h2 className="about-heading">
            Lorem ipsum dolor sit<br />amet, consectetuer
          </h2>
          <p className="about-subtext">
            Lorem ipsum dolor sit<br />
            amet, consectetuer<br />
            adipiscing elit ?
          </p>
          <button className="read-more-btn">Read More</button>
        </div>

        <div className="img-wrapper right-img">
          <img src={img2} alt="Relaxation" loading="lazy" />
        </div>

      </div>
    </section>
  );
};

export default AboutHero;