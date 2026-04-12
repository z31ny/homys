import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SeaSection.css';
import seaVid from '../vids/sea.mp4';

const SeaSection = () => {
  const navigate = useNavigate();

  return (
    <section className="sea-section">
      <video className="sea-video-bg" autoPlay muted loop playsInline preload="none">
        <source src={seaVid} type="video/mp4" />
      </video>
      <div className="sea-overlay"></div>
      <div className="sea-content">
        <h2 className="sea-title">Homys comfort <br /> with hotel standards</h2>
        <p className="sea-subtext">
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Integer condimentum adipiscing sapien proin. Aliquet amet non enim, ut aliquet in pulvinar eu. er condimentum adipiscing sapien proin. Aliquet amet entum adipiscing sapien proin. r condimentum adipiscin adipiscing sapien proin. Aliquet amet scing sapien proin. r condimentum adipiscin adipiscing sapien proin.
        </p>
        <button className="sea-details-btn" onClick={() => navigate('/AboutUs')}>
          Details
        </button>
      </div>
    </section>
  );
};

export default SeaSection;