import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMS } from '../useCMS';
import './SeaSection.css';
import seaVid from '../vids/sea.mp4';

const DEFAULTS = {
  title: 'Homys comfort\nwith hotel standards',
  subtitle: "At Homys, every property is professionally managed, rigorously inspected, and prepared with hotel-grade attention to detail. Crisp linens, spotless interiors, and a responsive team on standby — because a true sanctuary never compromises on quality.",
  buttonText: 'Details',
  buttonLink: '/aboutus',
};

const SeaSection = () => {
  const navigate = useNavigate();
  const c = useCMS('home_sea_section', DEFAULTS);

  return (
    <section className="sea-section">
      <video className="sea-video-bg" autoPlay muted loop playsInline preload="none">
        <source src={seaVid} type="video/mp4" />
      </video>
      <div className="sea-overlay"></div>
      <div className="sea-content">
        <h2 className="sea-title" style={{ whiteSpace: 'pre-line' }}>{c.title}</h2>
        <p className="sea-subtext">{c.subtitle}</p>
        <button className="sea-details-btn" onClick={() => navigate(c.buttonLink || '/aboutus')}>
          {c.buttonText || 'Details'}
        </button>
      </div>
    </section>
  );
};

export default SeaSection;
