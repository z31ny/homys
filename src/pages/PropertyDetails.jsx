import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [lightboxIndex, setLightboxIndex] = useState(null); // Track which gallery img is open
  const navigate = useNavigate();
  
  const heroImages = [heroImg, rect10, rect11, group14];
  const galleryImages = [rect6, rect9, rect10, rect11, frm, frame];

  const nextHero = () => setCurrentHeroIndex((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
  const prevHero = () => setCurrentHeroIndex((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1));

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const nextLightbox = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const prevLightbox = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  return (
    <div className="property-details-page">
      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lb-close" onClick={closeLightbox}>✕</button>
          <button className="lb-nav lb-prev" onClick={prevLightbox}>‹</button>
          <div className="lb-content">
            <img src={galleryImages[lightboxIndex]} alt="Zoomed view" className="lb-img" />
          </div>
          <button className="lb-nav lb-next" onClick={nextLightbox}>›</button>
          <div className="lb-counter">
            {lightboxIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}

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

          <div className="pd-info-grid">
            <div className="pd-info-section">
              <h2 className="pd-section-title">The Space</h2>
              <p className="pd-text">
                Experience the pinnacle of coastal luxury in our Executive Ocean Suite. Designed for 
                travelers seeking refined convenience and elegance.
              </p>
              <div className="pd-room-details-list">
                <div className="pd-room-detail-item"><span className="label">Bed Type:</span><span className="value">Ultra-Premium King</span></div>
                <div className="pd-room-detail-item"><span className="label">View:</span><span className="value">Panoramic Mediterranean</span></div>
                <div className="pd-room-detail-item"><span className="label">Climate:</span><span className="value">Dual-Zone AC</span></div>
              </div>
            </div>

            <div className="pd-info-section">
              <h2 className="pd-section-title">Room Features</h2>
              <ul className="pd-features-list">
                <li>Custom marble-finish bathroom</li>
                <li>Private walk-out terrace</li>
                <li>Kitchenette with Nespresso</li>
                <li>Ergonomic workstation</li>
              </ul>
            </div>
          </div>

          <div className="pd-about-grid">
            <div className="pd-about-text">
              <h2 className="pd-sub-title">Detailed Experience</h2>
              <p>Our rooms are designed to provide a sanctuary that doesn't compromise functionality.</p>
              <button className="pd-action-btn">Request Full Brochure</button>
            </div>
            <div className="pd-about-img-wrapper">
              <img src={group14} alt="Interior View" />
            </div>
          </div>

          <div className="pd-amenities">
            <h2 className="pd-sub-title">Amenities & Services</h2>
            <div className="pd-amenities-grid">
              <div className="amenity-item"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M12 20h.01" /></svg><span>High-Speed Wifi</span></div>
              <div className="amenity-item"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6c.6.5 1.2 1 2.5 1s2-1 4-1" /></svg><span>Infinity Pool</span></div>
              <div className="amenity-item"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="15" rx="2" /></svg><span>4K Smart TV</span></div>
              <div className="amenity-item"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 1v22M5 12h14" /></svg><span>Daily Housekeeping</span></div>
            </div>
          </div>
        </div>

        <aside className="pd-booking-sidebar">
          <div className="pd-booking-card">
            <h3 className="pd-booking-title">Reserve This Suite</h3>
            <div className="pd-price-display"><span className="pd-price-val">$ 280</span><span className="pd-price-unit">/ night</span></div>
            <div className="pd-booking-inputs">
              <div className="pd-input-group"><label>Arrival</label><input type="date" /></div>
              <div className="pd-input-group"><label>Departure</label><input type="date" /></div>
              <div className="pd-input-group full-width">
                <label>Guests</label>
                <select><option>1 Guest</option><option selected>2 Guests</option></select>
              </div>
            </div>
            <button className="pd-primary-btn" onClick={() => navigate('/cart')}>Book Now</button>
          </div>
        </aside>
      </section>

      <section className="pd-gallery">
        <div className="pd-gallery-header">
           <h2 className="pd-gallery-title libre">Visual Journal</h2>
           <p className="encode">Click on any image to expand your view.</p>
        </div>
        <div className="pd-gallery-grid-large">
          {galleryImages.map((img, index) => (
            <div key={index} className="gallery-item" onClick={() => openLightbox(index)}>
              <img src={img} alt={`Gallery ${index}`} />
              <div className="gallery-hover-overlay">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PropertyDetails;