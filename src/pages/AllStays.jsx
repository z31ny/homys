import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import './AllStays.css';

import fallbackImg from '../imgs/Frame 125.png';

const AllStays = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  // Filters
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchProperties = (page = 1) => {
    setLoading(true);
    const params = { page, limit };
    if (propertyType) params.propertyType = propertyType;
    if (location) params.location = location;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    propertiesAPI.list(params)
      .then((res) => {
        setProperties(res.data.properties || []);
        setTotal(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setCurrentPage(page);
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProperties(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProperties(1);
  };

  return (
    <div className="all-stays-page">
      <button className="back-btn-global" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <section className="all-stays-content">
        <h1 className="libre section-title">Explore All Stays</h1>
        <p className="encode" style={{ textAlign: 'center', opacity: 0.6, marginBottom: '40px' }}>
          {loading ? 'Loading...' : `${total} propert${total !== 1 ? 'ies' : 'y'} available`}
        </p>

        {/* Filter Bar */}
        <form className="as-filter-bar" onSubmit={handleSearch}>
          <div className="as-filter-item">
            <label className="encode">Location</label>
            <input
              type="text"
              className="encode"
              placeholder="e.g. Sahel, Cairo..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="as-filter-item">
            <label className="encode">Property Type</label>
            <select className="encode" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="chalet">Chalet</option>
              <option value="studio">Studio</option>
            </select>
          </div>
          <div className="as-filter-item">
            <label className="encode">Min Price</label>
            <input
              type="number"
              className="encode"
              placeholder="$0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div className="as-filter-item">
            <label className="encode">Max Price</label>
            <input
              type="number"
              className="encode"
              placeholder="$1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <button type="submit" className="as-search-btn encode">Search</button>
        </form>

        {/* Property Grid */}
        {loading ? (
          <div className="stays-grid-container">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="stay-card-v2" style={{ opacity: 0.3, minHeight: 280, background: '#e8e0d4' }} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p className="encode" style={{ opacity: 0.6, fontSize: '1.1rem', marginBottom: '20px' }}>
              No properties match your search criteria.
            </p>
            <button className="as-search-btn encode" onClick={() => { setPropertyType(''); setLocation(''); setMinPrice(''); setMaxPrice(''); fetchProperties(1); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="stays-grid-container">
            {properties.map(stay => (
              <div key={stay.id} className="stay-card-v2" onClick={() => navigate(`/stays/${stay.id}`)}>
                <div className="stay-img-box">
                  <img
                    src={stay.heroImageUrl || fallbackImg}
                    alt={stay.title}
                    onError={(e) => { e.target.src = fallbackImg; }}
                  />
                </div>
                <div className="stay-info-box">
                  <h3 className="libre">{stay.title}</h3>
                  <p className="encode" style={{ opacity: 0.7, fontSize: '0.85rem' }}>📍 {stay.locationName}</p>
                  <div className="encode" style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', opacity: 0.5, marginTop: '4px' }}>
                    {stay.bedrooms && <span>{stay.bedrooms} Bed{stay.bedrooms !== 1 ? 's' : ''}</span>}
                    {stay.bathrooms && <span>{stay.bathrooms} Bath{stay.bathrooms !== 1 ? 's' : ''}</span>}
                    {stay.propertyType && <span style={{ textTransform: 'capitalize' }}>{stay.propertyType}</span>}
                  </div>
                  <p className="encode" style={{ fontWeight: '800', color: '#112a3d', marginTop: '8px', fontSize: '1rem' }}>
                    ${stay.pricePerNight}/night
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '50px',
          }}>
            <button
              className="as-page-btn encode"
              disabled={currentPage === 1}
              onClick={() => fetchProperties(currentPage - 1)}
            >
              ← Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`as-page-btn encode ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => fetchProperties(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="as-page-btn encode"
              disabled={currentPage === totalPages}
              onClick={() => fetchProperties(currentPage + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default AllStays;