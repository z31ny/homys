import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import { HomeCard } from './Homes';
import './Homes.css';
import './FeaturedUnits.css';

const FeaturedUnits = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertiesAPI.getFeatured()
      .then((res) => setUnits(res.data.properties || []))
      .catch(() => setUnits([]))
      .finally(() => setLoading(false));
  }, []);

  // Don't render the section at all if no featured units exist
  if (!loading && units.length === 0) return null;

  return (
    <section className="featured-section">
      {/* Readable header above the cards */}
      <div className="featured-header">
        <p className="featured-eyebrow encode">HAND-PICKED FOR YOU</p>
        <h2 className="featured-title libre">Our Featured Units</h2>
      </div>

      {/* Cards — same grid + same HomeCard as Stays */}
      {loading ? (
        <div className="homes-grid featured-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="home-card home-card-skeleton" />
          ))}
        </div>
      ) : (
        <div className="homes-grid featured-grid">
          {units.map((unit) => (
            <HomeCard key={unit.id} home={unit} />
          ))}
        </div>
      )}

      <button
        className="featured-explore-btn encode"
        onClick={() => navigate('/stays')}
      >
        Explore All Stays
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
};

export default FeaturedUnits;
