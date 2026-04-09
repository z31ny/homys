import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import './Homes.css';

import fallbackImg from '../imgs/Frame 125.png';

const HomeCard = ({ home }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = home.heroImageUrl ? [home.heroImageUrl] : [fallbackImg];

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="home-card">
      <div className="home-img-wrapper">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((img, index) => (
            <img key={index} src={img} alt={home.title} className="home-main-img"
              onError={(e) => { e.target.src = fallbackImg; }}
            />
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button className="nav-arrow left" onClick={prevSlide}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="nav-arrow right" onClick={nextSlide}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        <div className="carousel-dots">
          {images.map((_, idx) => (
            <span key={idx} className={`dot ${currentIndex === idx ? 'active' : ''}`} />
          ))}
        </div>

        <button className="check-house-btn" onClick={() => navigate(`/stays/${home.id}`)}>
          Check Out House
        </button>
      </div>

      <div className="home-card-content">
        <h3 className="home-title">{home.title}</h3>
        <div className="home-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {home.locationName}
        </div>

        <div className="home-specs">
          {home.bedrooms && (
            <div className="spec-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 20v-8a2 2 0 012-2h16a2 2 0 012 2v8M4 10V6a2 2 0 012-2h12a2 2 0 012 2v4M2 12h20M7 7v3M17 7v3" />
              </svg>
              {home.bedrooms} Bed{home.bedrooms !== 1 ? 's' : ''}
            </div>
          )}
          {home.bathrooms && (
            <div className="spec-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 21h10M9 21v-2a2 2 0 012-2h2a2 2 0 012 2v2M3 7h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z" />
              </svg>
              {home.bathrooms} Bath{home.bathrooms !== 1 ? 's' : ''}
            </div>
          )}
          {home.sizeSqft && <div className="spec-item">{home.sizeSqft} sqft</div>}
        </div>

        <div className="home-price">${home.pricePerNight}/night</div>
      </div>
    </div>
  );
};

const Homes = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    propertiesAPI.list({ limit: 9 })
      .then((res) => {
        setProperties(res.data.properties || []);
        setTotal(res.data.pagination?.total || 0);
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="homes-section">
        <h2 className="homes-count-title">Loading properties…</h2>
        <div className="homes-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="home-card" style={{ opacity: 0.4, minHeight: 320, background: '#e8e0d4', borderRadius: 16 }} />
          ))}
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section className="homes-section">
        <h2 className="homes-count-title">No properties available yet</h2>
        <p style={{ textAlign: 'center', opacity: 0.6, padding: '40px 0' }}>
          Check back soon for new listings.
        </p>
      </section>
    );
  }

  return (
    <section className="homes-section">
      <h2 className="homes-count-title">{total} Home{total !== 1 ? 's' : ''}</h2>
      <div className="homes-grid">
        {properties.map((home) => (
          <HomeCard key={home.id} home={home} />
        ))}
      </div>

      {total > 9 && (
        <button className="explore-more-homes" onClick={() => navigate('/morehomes')}>
          Explore More
        </button>
      )}
    </section>
  );
};

export default Homes;