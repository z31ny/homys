import React, { useState } from 'react';
import './PropertyDetails.css';

import heroImg from '../imgs/StaysHero.png';
import group14 from '../imgs/Group 14.png'; 
import rect6 from '../imgs/Rectangle 6.png';
import rect9 from '../imgs/Rectangle 9.png';
import rect10 from '../imgs/Rectangle 10.png';
import rect11 from '../imgs/Rectangle 11.png';
import frm from '../imgs/Rectangle 11.png';
import frame from '../imgs/Rectangle 11.png';

const PropertyDetails = () => {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  
  const heroImages = [heroImg, rect10, rect11, group14];

  const nextHero = () => {
    setCurrentHeroIndex((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
  };

  const prevHero = () => {
    setCurrentHeroIndex((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1));
  };

  return (
    <div className="property-details-page">
      <section className="pd-hero">
        <div className="pd-hero-slider">
          <img src={heroImages[currentHeroIndex]} alt="Hero" className="pd-hero-img" />
          <button className="pd-nav-btn prev" onClick={prevHero}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button className="pd-nav-btn next" onClick={nextHero}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </section>

      <section className="pd-main-container">
        <div className="pd-left-content">
          <div className="pd-header">
            <h1 className="pd-title">Executive Ocean Suite</h1>
            <p className="pd-location">Downtown, North Coast • Property ID: HOM-2044</p>
            <div className="pd-specs-row">
              <div className="pd-spec-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 110-8 4 4 0 010 8z" /></svg>
                <span>2 Guests</span>
              </div>
              <div className="pd-spec-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                <span>1 Bedroom</span>
              </div>
              <div className="pd-spec-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.5"><path d="M2 12h20M7 7v3M17 7v3" /><rect x="2" y="10" width="20" height="10" rx="2" /></svg>
                <span>King Bed</span>
              </div>
              <div className="pd-spec-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2zM7 21h10" /></svg>
                <span>1200 sqft</span>
              </div>
            </div>
          </div>

          <div className="pd-description">
            <h2 className="pd-section-title">Overview</h2>
            <p>
              Experience the pinnacle of coastal luxury in our Executive Ocean Suite. Designed for 
              travelers seeking refined convenience and elegance, this property offers a seamless blend 
              of modern design and effortless comfort.
            </p>
            <div className="pd-detailed-features">
              <div className="feature-col">
                <h3>Interior Highlights</h3>
                <ul>
                  <li>Floor-to-ceiling panoramic windows</li>
                  <li>Custom-built Italian cabinetry</li>
                  <li>Smart home automation system</li>
                  <li>Premium Egyptian cotton linens</li>
                </ul>
              </div>
              <div className="feature-col">
                <h3>Guest Services</h3>
                <ul>
                  <li>24/7 Dedicated concierge</li>
                  <li>In-room dining options</li>
                  <li>Daily housekeeping & laundry</li>
                  <li>Private airport transfer</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pd-about-grid">
            <div className="pd-about-text">
              <h2 className="pd-sub-title">Detailed Experience</h2>
              <p>
                Our Executive Rooms are designed to provide a workspace that doesn't compromise on relaxation. 
                Featuring an ergonomic desk area and a private terrace overlooking the Mediterranean.
              </p>
              <button className="pd-action-btn">Request Details</button>
            </div>
            <div className="pd-about-img-wrapper">
              <img src={group14} alt="Interior View" />
            </div>
          </div>

          <div className="pd-amenities">
            <h2 className="pd-sub-title">Resort Amenities</h2>
            <div className="pd-amenities-grid">
              <div className="amenity-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.59 16a6 6 0 016.82 0M12 20h.01" /></svg>
                High-Speed Wifi
              </div>
              <div className="amenity-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6c.6.5 1.2 1 2.5 1s2-1 4-1 2.5 1 4 1 2.5-1 4-1 2.5 1 4 1" /></svg>
                Infinity Pool
              </div>
              <div className="amenity-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="15" rx="2" /></svg>
                Smart Television
              </div>
              <div className="amenity-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /></svg>
                Premium Dining
              </div>
            </div>
          </div>
        </div>

        <aside className="pd-booking-sidebar">
          <div className="pd-booking-card">
            <h3 className="pd-booking-title">Reserve This Suite</h3>
            <div className="pd-price-display">
              <span className="pd-price-val">$ 280</span>
              <span className="pd-price-unit">/ night</span>
            </div>
            <div className="pd-booking-inputs">
              <div className="pd-input-group">
                <label>Arrival</label>
                <input type="date" />
              </div>
              <div className="pd-input-group">
                <label>Departure</label>
                <input type="date" />
              </div>
            </div>
            <button className="pd-primary-btn">Secure Booking</button>
          </div>
        </aside>
      </section>

      <section className="pd-gallery">
        <h2 className="pd-gallery-title">Visual Journal</h2>
        <div className="pd-gallery-grid">
          <img src={rect6} alt="Gallery" />
          <img src={rect9} alt="Gallery" />
          <img src={rect10} alt="Gallery" />
          <img src={rect11} alt="Gallery" />
          <img src={frm} alt="Gallery" />
          <img src={frame} alt="Gallery" />
        </div>
      </section>
    </div>
  );
};

export default PropertyDetails;