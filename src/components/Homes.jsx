import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import './Homes.css';

import { responsiveProps } from '../staticAssets';
import fallbackImg from '../imgs/Frame 125.png';

/* ── Single card ── */
export const HomeCard = ({ home }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // Use all property images if available, otherwise fall back to heroImageUrl
  const images = home.images?.length > 0
    ? home.images
    : home.heroImageUrl
    ? [home.heroImageUrl]
    : [fallbackImg];

  const nextSlide = (e) => { e.stopPropagation(); setCurrentIndex((p) => (p === images.length - 1 ? 0 : p + 1)); };
  const prevSlide = (e) => { e.stopPropagation(); setCurrentIndex((p) => (p === 0 ? images.length - 1 : p - 1)); };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      e.stopPropagation();
      if (dx < 0) setCurrentIndex((p) => (p === images.length - 1 ? 0 : p + 1));
      else setCurrentIndex((p) => (p === 0 ? images.length - 1 : p - 1));
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const hasDiscount = !!home.discountPercent && parseFloat(home.discountPercent) > 0;

  const LABEL_META = {
    best_seller:    { text: 'Best Seller',    icon: '🏆', cls: 'lbl-bestseller' },
    guest_favorite: { text: 'Guest Favorite', icon: '❤',  cls: 'lbl-favorite' },
    new:            { text: 'New',            icon: '✦',  cls: 'lbl-new' },
  };
  const labelMeta = LABEL_META[home.propertyLabel];

  return (
    <div className="home-card" onClick={() => navigate(`/stays/${home.id}`)} style={{ cursor: 'pointer' }}>
      <div className="home-img-wrapper" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="carousel-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {images.map((img, index) => {
            const imgProps = responsiveProps(img, '(max-width: 768px) 100vw, 400px');
            return (
              <img
                key={index}
                {...imgProps}
                alt={home.title}
                className="home-main-img"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  if (e.target.srcset) {
                    e.target.removeAttribute('srcset');
                    e.target.removeAttribute('sizes');
                    e.target.src = img;
                  } else {
                    e.target.src = fallbackImg;
                  }
                }}
              />
            );
          })}
        </div>

        {images.length > 1 && (
          <>
            <button className="nav-arrow left" onClick={prevSlide}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button className="nav-arrow right" onClick={nextSlide}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </>
        )}

        <div className="carousel-dots">
          {images.map((_, idx) => <span key={idx} className={`dot ${currentIndex === idx ? 'active' : ''}`} />)}
        </div>

        {labelMeta && (
          <div className={`home-label-badge ${labelMeta.cls}`}>
            <span className="hlb-text">{labelMeta.text}</span>
          </div>
        )}

        {hasDiscount && (
          <div className="home-discount-badge">
            {parseFloat(home.discountPercent).toFixed(0)}% OFF
          </div>
        )}

        <div className="check-house-hover-hint">View Property →</div>
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

        <div className="home-price-row">
          {hasDiscount && home.originalPricePerNight && (
            <span className="home-price-original">
              EGP {parseFloat(home.originalPricePerNight).toFixed(0)}
            </span>
          )}
          <span className="home-price" style={hasDiscount ? { color: '#c0392b' } : {}}>
            EGP {parseFloat(home.pricePerNight).toFixed(0)}/night
          </span>
        </div>
        {hasDiscount && home.discountLabel && (
          <p className="home-discount-label">{home.discountLabel}</p>
        )}
      </div>
    </div>
  );
};

/* ── Grid ── */
const LIMIT = 9;

const Homes = ({ filters = {} }) => {
  const [properties, setProperties]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [total, setTotal]             = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [noResults, setNoResults]     = useState(false);

  const fetchProperties = useCallback((page = 1) => {
    setLoading(true);
    setNoResults(false);
    const params = { page, limit: LIMIT };
    if (filters.location)     params.location     = filters.location;
    if (filters.propertyType) params.propertyType = filters.propertyType;
    if (filters.minPrice)     params.minPrice     = filters.minPrice;
    if (filters.maxPrice)     params.maxPrice     = filters.maxPrice;
    if (filters.bedrooms)     params.bedrooms     = filters.bedrooms;

    propertiesAPI.list(params)
      .then((res) => {
        const props = res.data.properties || [];
        setProperties(props);
        setTotal(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setCurrentPage(page);
        if (props.length === 0) setNoResults(true);
      })
      .catch(() => { setProperties([]); setNoResults(true); })
      .finally(() => setLoading(false));
  }, [
    filters.location,
    filters.propertyType,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
  ]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchProperties(1);
  }, [
    filters.location,
    filters.propertyType,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
  ]);

  const goToPage = (page) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchProperties(page);
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <section className="homes-section">
        <div className="homes-count-title homes-loading-bar" />
        <div className="homes-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="home-card home-card-skeleton" />
          ))}
        </div>
      </section>
    );
  }

  /* ── No results ── */
  if (noResults) {
    return (
      <section className="homes-section">
        <h2 className="homes-count-title">No properties found</h2>
        <div className="homes-empty">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.2" opacity="0.3">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <p>No properties match your current filters. Try adjusting or clearing them.</p>
        </div>
      </section>
    );
  }

  /* ── Pagination helper ── */
  const pageNumbers = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    const pages = [];
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('…');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push('…');
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('…');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push('…');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <section className="homes-section">
      <h2 className="homes-count-title">
        {total} Home{total !== 1 ? 's' : ''}
        {(filters.location || filters.propertyType || filters.minPrice || filters.maxPrice || filters.bedrooms) && (
          <span className="homes-filter-tag"> — filtered</span>
        )}
      </h2>

      <div className="homes-grid">
        {properties.map((home) => <HomeCard key={home.id} home={home} />)}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="homes-pagination">
          <button
            className="hp-btn hp-arrow"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            ←
          </button>

          {pageNumbers().map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="hp-ellipsis">…</span>
            ) : (
              <button
                key={p}
                className={`hp-btn ${currentPage === p ? 'active' : ''}`}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            className="hp-btn hp-arrow"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            →
          </button>
        </div>
      )}
    </section>
  );
};

export default Homes;
