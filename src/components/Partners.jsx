import React from 'react';
import { useCMS } from '../useCMS';
import './Partners.css';
const group14 = 'https://res.cloudinary.com/dzpswgjsm/image/upload/f_auto,q_auto,w_800/homys-static/Group_14.png';
import rect9  from '../imgs/Rectangle 9.png';
import rect10 from '../imgs/Rectangle 10.png';
import rect11 from '../imgs/Rectangle 11.png';
import rect6  from '../imgs/Rectangle 6.png';

const FALLBACK_THUMBS = [rect9, rect10, rect11, rect6];

const DEFAULTS = {
  title: 'Explore Our Upcoming Partners & Stays',
  featuredImage: group14,
  featuredTitle: 'Forums',
  featuredSubtitle: 'Premium coastal experiences curated for you.',
  thumbnails: ['', '', '', ''],
};

const Partners = () => {
  const c = useCMS('stays_partners', DEFAULTS);
  const thumbs = c.thumbnails?.length ? c.thumbnails : DEFAULTS.thumbnails;

  return (
    <section className="partners-section">
      <div className="partners-header">
        <h2 className="partners-title">{c.title || DEFAULTS.title}</h2>
        <div className="partners-arrow">
          <svg width="60" height="20" viewBox="0 0 63 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 7.5H61M61 7.5L54 0.5M61 7.5L54 14.5" stroke="#112a3d" strokeWidth="1"/>
          </svg>
        </div>
      </div>
      <div className="partners-grid-container">
        <div className="featured-partner">
          <div className="partner-img-wrapper">
            <img src={c.featuredImage || group14} alt="Featured" />
            <div className="partner-overlay">
              <div className="overlay-circle">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                </svg>
              </div>
              <h3>{c.featuredTitle || 'Forums'}</h3>
              <p>{c.featuredSubtitle || ''}</p>
            </div>
          </div>
        </div>
        <div className="partners-thumbnails">
          {thumbs.map((url, i) => (
            <div key={i} className="thumb-wrapper">
              <img src={url || FALLBACK_THUMBS[i]} alt={`Stay ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
