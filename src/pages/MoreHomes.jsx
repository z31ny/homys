import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { propertiesAPI } from '../services/api';
import './MoreHomes.css';

import fallbackImg from '../imgs/Frame 125.png';

const PropertyCard = ({ home }) => {
  const navigate = useNavigate();
  return (
    <div className="m-home-card" onClick={() => navigate(`/stays/${home.id}`)}>
      <div className="m-img-container">
        <img
          src={home.heroImageUrl || fallbackImg}
          alt={home.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = fallbackImg; }}
        />
      </div>
      <div className="m-info">
        <h3 className="libre">{home.title}</h3>
        <p className="encode loc">📍 {home.locationName}</p>
        <div className="m-specs encode">
          {home.bedrooms && <span>{home.bedrooms} Bed{home.bedrooms !== 1 ? 's' : ''}</span>}
          {home.sizeSqft && <span>{home.sizeSqft} sqft</span>}
        </div>
        <div className="m-footer">
          <span className="m-price">${home.pricePerNight}/night</span>
          <button className="m-view-btn encode">Check Out</button>
        </div>
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

      {/* Clean back button — same style as the rest of the site */}
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
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>Prev</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} className={currentPage === i + 1 ? 'active' : ''} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default MoreHomes;
