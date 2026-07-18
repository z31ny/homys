import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMS } from '../useCMS';
import './AboutHero.css';
import img1 from '../imgs/img1.png';
import img2 from '../imgs/img2.png';
import loggo from '../imgs/loggo.png';

const DEFAULTS = {
  heading: 'More than a stay\na story worth telling.',
  subtext: "Homys is where curated design meets genuine Egyptian hospitality. Whether you're chasing the Sahel sun or escaping to a Cairo penthouse, every property we manage reflects our obsession with quality, comfort, and the art of feeling at home wherever you are.",
  buttonText: 'Read More',
  image1: '',
  image2: '',
  logo: '',
};

const AboutHero = () => {
  const navigate = useNavigate();
  const c = useCMS('home_about', DEFAULTS);

  return (
    <section className="about-section">
      <div className="about-container">
        <div className="img-wrapper left-img">
          <img src={c.image1 || img1} alt="Leisure" loading="lazy" />
        </div>
        <div className="about-content">
          <img src={c.logo || loggo} alt="HO Logo" className="ho-logo" />
          <h2 className="about-heading" style={{ whiteSpace: 'pre-line' }}>{c.heading}</h2>
          <p className="about-subtext">{c.subtext}</p>
          <button className="read-more-btn" onClick={() => navigate('/aboutus')}>{c.buttonText || 'Read More'}</button>
        </div>
        <div className="img-wrapper right-img">
          <img src={c.image2 || img2} alt="Relaxation" loading="lazy" />
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
