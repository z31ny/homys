import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import './PropertyDetails.css';

import fallbackImg from '../imgs/StaysHero.png';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Booking sidebar state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numGuests, setNumGuests] = useState(1);

  useEffect(() => {
    if (!id) {
      setError('No property selected.');
      setLoading(false);
      return;
    }
    propertiesAPI.getById(id)
      .then((res) => setProperty(res.data.property))
      .catch((err) => setError(err.message || 'Property not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="property-details-page" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <p style={{ opacity: 0.5, fontSize: '1.1rem' }}>Loading property…</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="property-details-page" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 16 }}>Property Not Found</h2>
        <p style={{ opacity: 0.6, marginBottom: 32 }}>{error || 'This property does not exist or is unavailable.'}</p>
        <button className="pd-primary-btn" onClick={() => navigate('/stays')}>Back to Stays</button>
      </div>
    );
  }

  // Build image arrays from real data
  const heroImages = property.images?.length > 0
    ? property.images.map(img => img.imageUrl)
    : [fallbackImg];
  const galleryImages = heroImages;

  const nextHero = () => setCurrentHeroIndex((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
  const prevHero = () => setCurrentHeroIndex((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1));

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextLightbox = (e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1)); };
  const prevLightbox = (e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1)); };

  // Calculate nights and total for the sidebar
  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
    : 0;
  const basePrice = nights * parseFloat(property.pricePerNight || 0);

  const handleBookNow = () => {
    if (!checkIn || !checkOut || nights <= 0) {
      alert('Please select valid check-in and check-out dates.');
      return;
    }
    navigate('/cart', {
      state: {
        propertyId: property.id,
        title: property.title,
        locationName: property.locationName,
        heroImageUrl: heroImages[0],
        pricePerNight: parseFloat(property.pricePerNight),
        checkIn,
        checkOut,
        nights,
        numGuests,
        basePrice,
      },
    });
  };

  return (
    <div className="property-details-page">
      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lb-close" onClick={closeLightbox}>✕</button>
          <button className="lb-nav lb-prev" onClick={prevLightbox}>‹</button>
          <div className="lb-content">
            <img src={galleryImages[lightboxIndex]} alt="Zoomed view" className="lb-img"
              onError={(e) => { e.target.src = fallbackImg; }} />
          </div>
          <button className="lb-nav lb-next" onClick={nextLightbox}>›</button>
          <div className="lb-counter">{lightboxIndex + 1} / {galleryImages.length}</div>
        </div>
      )}

      <section className="pd-hero">
        <div className="pd-hero-slider">
          <img
            src={heroImages[currentHeroIndex]}
            alt="Hero"
            className="pd-hero-img"
            onError={(e) => { e.target.src = fallbackImg; }}
          />
          {heroImages.length > 1 && (
            <>
              <button className="pd-nav-btn prev" onClick={prevHero}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button className="pd-nav-btn next" onClick={nextHero}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </>
          )}
        </div>
      </section>

      <section className="pd-main-container">
        <div className="pd-left-content">
          <div className="pd-header">
            <h1 className="pd-title">{property.title}</h1>
            <p className="pd-location">
              {property.locationName}
              {property.propertyIdDisplay && ` • Property ID: ${property.propertyIdDisplay}`}
            </p>
            <div className="pd-specs-row">
              {property.maxGuests && (
                <div className="pd-spec-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 110-8 4 4 0 010 8z" /></svg>
                  <span>{property.maxGuests} Guests</span>
                </div>
              )}
              {property.bedrooms && (
                <div className="pd-spec-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                  <span>{property.bedrooms} Bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="pd-spec-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.5"><path d="M2 12h20M7 7v3M17 7v3" /><rect x="2" y="10" width="20" height="10" rx="2" /></svg>
                  <span>{property.bathrooms} Bath{property.bathrooms !== 1 ? 's' : ''}</span>
                </div>
              )}
              {property.sizeSqft && (
                <div className="pd-spec-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2zM7 21h10" /></svg>
                  <span>{property.sizeSqft} sqft</span>
                </div>
              )}
            </div>
          </div>

          <div className="pd-info-grid">
            {property.description && (
              <div className="pd-info-section">
                <h2 className="pd-section-title">The Space</h2>
                <p className="pd-text">{property.description}</p>
              </div>
            )}

            {property.features?.length > 0 && (
              <div className="pd-info-section">
                <h2 className="pd-section-title">Features & Amenities</h2>
                <ul className="pd-features-list">
                  {property.features.map((feat, i) => <li key={i}>{feat}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* BOOKING SIDEBAR */}
        <aside className="pd-booking-sidebar">
          <div className="pd-booking-card">
            <h3 className="pd-booking-title">Reserve This Property</h3>
            <div className="pd-price-display">
              <span className="pd-price-val">$ {parseFloat(property.pricePerNight).toFixed(0)}</span>
              <span className="pd-price-unit">/ night</span>
            </div>
            <div className="pd-booking-inputs">
              <div className="pd-input-group">
                <label>Arrival</label>
                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div className="pd-input-group">
                <label>Departure</label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
              <div className="pd-input-group full-width">
                <label>Guests</label>
                <select value={numGuests} onChange={(e) => setNumGuests(Number(e.target.value))}>
                  {[...Array(property.maxGuests || 6)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
            {nights > 0 && (
              <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: '8px 0 0', textAlign: 'center' }}>
                ${parseFloat(property.pricePerNight).toFixed(0)} × {nights} night{nights !== 1 ? 's' : ''} = <strong>${basePrice.toFixed(2)}</strong>
              </p>
            )}
            <button className="pd-primary-btn" onClick={handleBookNow}>Book Now</button>
          </div>
        </aside>
      </section>

      {/* GALLERY */}
      {galleryImages.length > 1 && (
        <section className="pd-gallery">
          <div className="pd-gallery-header">
            <h2 className="pd-gallery-title libre">Visual Journal</h2>
            <p className="encode">Click on any image to expand your view.</p>
          </div>
          <div className="pd-gallery-grid-large">
            {galleryImages.map((img, index) => (
              <div key={index} className="gallery-item" onClick={() => openLightbox(index)}>
                <img src={img} alt={`Gallery ${index}`}
                  onError={(e) => { e.target.src = fallbackImg; }} />
                <div className="gallery-hover-overlay">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PropertyDetails;