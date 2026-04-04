import React from 'react';
import './StaysHero.css';
import separator2 from '../imgs/separator2.png';
import StaysHeroImg from '../imgs/StaysHero.png';
import star from '../imgs/star.png';

const StaysHero = () => {
  return (
    <section className="stays-hero-section">
      <div className="stays-separator">
        <img src={separator2} alt="separator" />
      </div>

      <div className="filter-bar">
        <div className="filter-group-left">
          <button className="filter-pill active">All</button>
          <img src={star} alt="star" className="star-icon" />
          <button className="filter-pill">Fouka Bay</button>
          <button className="filter-pill">Almaza Bay</button>
          <button className="filter-pill">Mountain View</button>
        </div>

        <div className="filter-group-right">
          <img src={star} alt="star" className="star-icon" />
          <button className="filter-pill filter-btn">
            Filter
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 21v-7m0-4V3m8 18v-11m0-4V3m8 18v-3m0-4V3M1 14h6m2-6h6m2 10h6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="hero-image-container">
        <img src={StaysHeroImg} alt="Stays Hero" className="hero-main-img" />
      </div>
    </section>
  );
};

export default StaysHero;