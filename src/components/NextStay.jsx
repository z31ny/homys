import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import './NextStay.css';
import frame109 from '../imgs/Frame 109.png';
import frame110 from '../imgs/Frame 110.png';
import frame111 from '../imgs/Frame 111.png';
import frame112 from '../imgs/Frame 112.png';
import houseIcon from '../imgs/house-icon.png';

// The four destination cards shown on the homepage.
// Each one queries the API for a real count of approved properties in that location.
const DESTINATIONS = [
  { id: 1, title: 'Gouna',         keyword: 'Gouna',    image: frame109 },
  { id: 2, title: 'Fouka Bay',     keyword: 'Fouka',    image: frame110 },
  { id: 3, title: 'Mountain View', keyword: 'Mountain', image: frame111 },
  { id: 4, title: 'Almaza Bay',    keyword: 'Almaza',   image: frame112 },
];

const NextStay = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    // Fire a count query per destination in parallel
    DESTINATIONS.forEach(({ id, keyword }) => {
      propertiesAPI
        .list({ location: keyword, limit: 1 })
        .then((res) => {
          const total = res.data?.pagination?.total ?? 0;
          setCounts((prev) => ({ ...prev, [id]: total }));
        })
        .catch(() => {
          setCounts((prev) => ({ ...prev, [id]: 0 }));
        });
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
        <h2 className="stay-main-title">Your Next Stay,<br />Thoughtfully Chosen.</h2>
        <p className="stay-description">
          From coastal retreats along Egypt's serene shores to refined city sanctuaries in the heart of Cairo,
          every Homys property is carefully selected for its distinctive character, vibrant community, and
          elevated standard of living. We go beyond location — curating homes that reflect thoughtful design,
          privacy, and effortless comfort.
        </p>
      </div>

      <div className="stay-grid">
        {DESTINATIONS.map((item) => (
          <div
            key={item.id}
            className="stay-card"
            onClick={() => navigate(`/all-stays?location=${encodeURIComponent(item.keyword)}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="stay-image-container">
              <img src={item.image} alt={item.title} className="bg-img" loading="lazy" />
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
        Explore More
      </button>
    </section>
  );
};

export default NextStay;
