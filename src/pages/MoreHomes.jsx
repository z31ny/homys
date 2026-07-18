import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { propertiesAPI } from '../services/api';
import './MoreHomes.css';
import '../components/Homes.css';

import fallbackImg from '../imgs/Frame 125.png';

const PropertyCard = ({ home }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef(null);

  const hasDiscount = !!home.discountPercent && parseFloat(home.discountPercent) > 0;

  const images =
    home.images?.length > 0
      ? home.images
      : home.heroImageUrl
      ? [home.heroImageUrl]
      : [fallbackImg];

  const nextSlide = (e) => {
    e.stopPropagation();
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: trackRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: -trackRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const handleScroll = (e) => {
    const idx = Math.round(e.target.scrollLeft / e.target.clientWidth);
    if (idx !== currentIndex && idx >= 0 && idx < images.length) {
      setCurrentIndex(idx);
    }
  };

  return (
    <div className="m-home-card" onClick={() => navigate(`/stays/${home.id}`)}>
      {/* ── Swipeable image carousel ── */}
      <div className="m-img-container" style={{ position: 'relative' }}>
        <div className="carousel-track" ref={trackRef} onScroll={handleScroll}>
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={home.title}
              className="home-main-img"
              loading={index === 0 ? 'eager' : 'lazy'}
              onError={(e) => { e.target.src = fallbackImg; }}
            />
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button className="nav-arrow left" onClick={prevSlide} aria-label="Previous image">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="nav-arrow right" onClick={nextSlide} aria-label="Next image">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <div className="carousel-dots">
              {images.map((_, idx) => (
                <span key={idx} className={`dot ${currentIndex === idx ? 'active' : ''}`} />
              ))}
            </div>
          </>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <span className="m-discount-badge">
            {parseFloat(home.discountPercent).toFixed(0)}% OFF
          </span>
        )}
      </div>

      <div className="m-info">
        <h3 className="libre">{home.title}</h3>
        <p className="encode loc">📍 {home.locationName}</p>
        <div className="m-specs encode">
          {home.bedrooms && <span>{home.bedrooms} Bed{home.bedrooms !== 1 ? 's' : ''}</span>}
          {home.sizeSqft && <span>{home.sizeSqft} sqft</span>}
        </div>
        <div className="m-footer">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            {hasDiscount && home.originalPricePerNight && (
              <span style={{ fontSize: '0.85rem', color: '#999', textDecoration: 'line-through', fontWeight: 600, fontFamily: 'inherit' }}>
                EGP {parseFloat(home.originalPricePerNight).toFixed(0)}
              </span>
            )}
            <span className="m-price" style={hasDiscount ? { color: '#c0392b' } : {}}>
              EGP {parseFloat(home.pricePerNight).toFixed(0)}/night
            </span>
          </div>
          <button className="m-view-btn encode">Check Out</button>
        </div>
        {hasDiscount && home.discountLabel && (
          <p style={{ fontSize: '0.72rem', color: '#c0392b', fontWeight: 700, margin: '4px 0 0', fontFamily: 'inherit' }}>
            {home.discountLabel}
          </p>
        )}
      </div>
    </div>
  );
};

const MoreHomes = () => {
  const navigate = useNavigate();
  const [properties, setProperties]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const limit = 6;

  useEffect(() => {
    setLoading(true);
    propertiesAPI.list({ page: currentPage, limit })
      .then((res) => {
        setProperties(res.data.properties || []);
        setTotal(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [currentPage]);

  return (
    <div className="more-homes-page">
      <button className="mh-back-btn" onClick={() => navigate('/stays')}>
        <ArrowLeft size={18} />
        Back to Stays
      </button>

      <header className="mh-header">
        <h1 className="libre">All Sanctuaries</h1>
        <p className="encode">
          {loading
            ? 'Loading properties…'
            : `Showing ${total} premium propert${total !== 1 ? 'ies' : 'y'} available for your stay.`}
        </p>
      </header>

      {loading ? (
        <div className="mh-grid">
          {[...Array(limit)].map((_, i) => (
            <div key={i} style={{ background: '#e8e0d4', borderRadius: 16, minHeight: 280, opacity: 0.4 }} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <p className="encode" style={{ textAlign: 'center', padding: '60px 0', opacity: 0.6 }}>
          No properties found.
        </p>
      ) : (
        <div className="mh-grid">
          {properties.map((home) => <PropertyCard key={home.id} home={home} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Prev</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} className={currentPage === i + 1 ? 'active' : ''} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default MoreHomes;
