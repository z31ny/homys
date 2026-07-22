import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMS } from '../useCMS';
import { propertiesAPI } from '../services/api';
import { staticUrl, optimizedUrl, responsiveProps } from '../staticAssets';
import './Hero.css';

const DEFAULTS = {
  backgroundImage: staticUrl('hero.png'),
  showListPropertyButton: true,
};

const Hero = () => {
  const navigate = useNavigate();
  const c = useCMS('home_hero', DEFAULTS);
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');
  const [locations, setLocations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const locationRef = useRef(null);
  const checkOutRef = useRef(null);

  const rawBg = c.backgroundImage || DEFAULTS.backgroundImage;
  const desktopBg = optimizedUrl(rawBg, 'lg');
  const mobileProps = responsiveProps(rawBg, '100vw');

  // Fetch the distinct project names across live properties (destination list)
  useEffect(() => {
    propertiesAPI.list({ limit: 500 })
      .then((res) => {
        const props = res.data?.properties || [];
        // Distinct project names, de-duplicated case-insensitively (keep first spelling)
        const seen = new Map();
        props.forEach((p) => {
          const name = (p.projectName || '').trim();
          if (name && !seen.has(name.toLowerCase())) seen.set(name.toLowerCase(), name);
        });
        setLocations([...seen.values()].sort((a, b) => a.localeCompare(b)));
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);


  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('project', location);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    navigate(`/all-stays${params.toString() ? '?' + params.toString() : ''}`);
  };

  return (
    <section className="hero-section">
      <div className="hero-bg" style={{ backgroundImage: `url(${desktopBg}), url(${rawBg})` }}>

        {/* Mobile-only img — replaces CSS background on portrait screens so the
            full villa side of the landscape image is visible without extreme zoom */}
        <img
          className="hero-mobile-img"
          {...mobileProps}
          alt="Homys Featured Villa"
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          onError={(e) => {
            if (e.target.srcset) {
              e.target.removeAttribute('srcset');
              e.target.removeAttribute('sizes');
              e.target.src = rawBg;
            }
          }}
          style={{ width: '100%' }}
        />

        {c.showListPropertyButton !== false && (
          <div className="list-property-btn" onClick={() => navigate('/list-property')}>
            <span className="hover-text">List your property</span>
            <div className="icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
          </div>
        )}

        <div className="booking-bar">
          <div ref={locationRef} className={`booking-item${location ? ' has-value' : ''}`} style={{ position: 'relative' }}>
            <div className="item-label">
              <svg className="white-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <h3>Destination</h3>
            </div>
            <p className="item-sub">{location || "Which project?"}</p>
            <input
              type="text"
              readOnly
              placeholder="Select a project..."
              className="hover-input"
              value={location}
              style={{ cursor: 'pointer' }}
              onClick={() => setShowDropdown((s) => !s)}
            />
            {showDropdown && locations.length > 0 && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: 0,
                minWidth: '220px',
                maxHeight: '260px',
                overflowY: 'auto',
                background: '#fff',
                borderRadius: '14px',
                boxShadow: '0 8px 32px rgba(17,42,61,0.18)',
                zIndex: 50,
                border: '1px solid #e8e0d4',
              }}>
                {locations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); setLocation(loc); setShowDropdown(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '11px 16px',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: "'Encode Sans Expanded', sans-serif",
                      fontSize: '0.85rem',
                      color: '#112a3d',
                      fontWeight: 500,
                      borderBottom: '1px solid #f0ece4',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9f6f1'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4a369" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>
          <label className={`booking-item${checkIn ? ' has-value' : ''}`}>
            <div className="item-label">
              <svg className="white-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <h3>Check In</h3>
            </div>
            <p className="item-sub">{checkIn || "Select date"}</p>
            <input
              type="date"
              className="hover-input"
              value={checkIn}
              onChange={(e) => {
                const v = e.target.value;
                setCheckIn(v);
                // If the current checkout is no longer after the new check-in, clear it
                if (checkOut && v && checkOut <= v) setCheckOut('');
                // Auto-open the checkout picker. Must run synchronously inside the
                // change handler to keep the browser's user-gesture activation —
                // a setTimeout here drops it and showPicker() silently no-ops.
                const el = checkOutRef.current;
                if (el) {
                  try { el.showPicker?.(); } catch { /* unsupported / not allowed */ }
                  el.focus();
                }
              }}
            />
          </label>
          <label className={`booking-item${checkOut ? ' has-value' : ''}`}>
            <div className="item-label">
              <svg className="white-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <h3>Check Out</h3>
            </div>
            <p className="item-sub">{checkOut || "Select date"}</p>
            <input
              ref={checkOutRef}
              type="date"
              className="hover-input"
              value={checkOut}
              min={checkIn || undefined}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </label>
          <label className={`booking-item${guests ? ' has-value' : ''}`}>
            <div className="item-label">
              <svg className="white-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <h3>Guests</h3>
            </div>
            <p className="item-sub">{guests ? `${guests} Guest${guests > 1 ? 's' : ''}` : "Who's coming?"}</p>
            <input
              type="number"
              className="hover-input"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              min="1"
              placeholder="Number of guests"
            />
          </label>
          <button className="search-btn" onClick={handleSearch}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
