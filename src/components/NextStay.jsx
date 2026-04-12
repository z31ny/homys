import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NextStay.css';
import frame109 from '../imgs/Frame 109.png';
import frame110 from '../imgs/Frame 110.png';
import frame111 from '../imgs/Frame 111.png';
import frame112 from '../imgs/Frame 112.png';
import houseIcon from '../imgs/house-icon.png';

const NextStay = () => {
  const navigate = useNavigate();

  const destinations = [
    { id: 1, title: 'Gouna', homes: '3 Homes', image: frame109 },
    { id: 2, title: 'Fouka Bay', homes: '15 Homes', image: frame110 },
    { id: 3, title: 'Mountain View', homes: '9 Homes', image: frame111 },
    { id: 4, title: 'Almaza Bay', homes: '21 Homes', image: frame112 },
  ];

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
        {destinations.map((item) => (
          <div key={item.id} className="stay-card">
            <div className="stay-image-container">
              <img src={item.image} alt={item.title} className="bg-img" loading="lazy" />
              <div className="stay-overlay">
                <h3 className="destination-name">{item.title}</h3>
              </div>
            </div>
            <div className="stay-footer">
              <img src={houseIcon} alt="house" className="house-icon-img" />
              <span className="home-count">{item.homes}</span>
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