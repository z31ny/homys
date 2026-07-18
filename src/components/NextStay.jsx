import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import { useCMS } from '../useCMS';
import './NextStay.css';
import frame109 from '../imgs/Frame 109.png';
import frame110 from '../imgs/Frame 110.png';
import frame111 from '../imgs/Frame 111.png';
import frame112 from '../imgs/Frame 112.png';
import houseIcon from '../imgs/house-icon.png';

const FALLBACK_IMAGES = [frame109, frame110, frame111, frame112];

const DEFAULTS = {
  sectionTitle: 'Your Next Stay,\nThoughtfully Chosen.',
  sectionSubtitle: "From coastal retreats along Egypt's serene shores to refined city sanctuaries in the heart of Cairo, every Homys property is carefully selected for its distinctive character, vibrant community, and elevated standard of living.",
  exploreButtonText: 'Explore More',
  destinations: [
    { id: 1, title: 'Gouna',         keyword: 'Gouna',    image: '' },
    { id: 2, title: 'Fouka Bay',     keyword: 'Fouka',    image: '' },
    { id: 3, title: 'Mountain View', keyword: 'Mountain', image: '' },
    { id: 4, title: 'Almaza Bay',    keyword: 'Almaza',   image: '' },
  ],
};

const NextStay = () => {
  const navigate = useNavigate();
  const c = useCMS('home_destinations', DEFAULTS);
  const [counts, setCounts] = useState({});

  const destinations = c.destinations?.length ? c.destinations : DEFAULTS.destinations;

  useEffect(() => {
    destinations.forEach(({ id, keyword }) => {
      propertiesAPI.list({ location: keyword, limit: 1 })
        .then((res) => setCounts((prev) => ({ ...prev, [id]: res.data?.pagination?.total ?? 0 })))
        .catch(() => setCounts((prev) => ({ ...prev, [id]: 0 })));
    });
  }, []);

  const label = (id) => {
    if (!(id in counts)) return '…';
    const n = counts[id];
    return `${n} Home${n !== 1 ? 's' : ''}`;
  };

  return (
    <section className="stay-section">
      <div className="stay-header">
        <h2 className="stay-main-title" style={{ whiteSpace: 'pre-line' }}>{c.sectionTitle}</h2>
        <p className="stay-description">{c.sectionSubtitle}</p>
      </div>
      <div className="stay-grid">
        {destinations.map((item, i) => (
          <div key={item.id ?? i} className="stay-card"
            onClick={() => navigate(`/all-stays?location=${encodeURIComponent(item.keyword)}`)}
            style={{ cursor: 'pointer' }}>
            <div className="stay-image-container">
              <img src={item.image || FALLBACK_IMAGES[i] || frame109} alt={item.title} className="bg-img" loading="lazy" />
              <div className="stay-overlay">
                <h3 className="destination-name">{item.title}</h3>
              </div>
            </div>
            <div className="stay-footer">
              <img src={houseIcon} alt="house" className="house-icon-img" />
              <span className="home-count">{label(item.id)}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="explore-button" onClick={() => navigate('/all-stays')}>
        {c.exploreButtonText || 'Explore More'}
      </button>
    </section>
  );
};

export default NextStay;
