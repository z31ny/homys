import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AllStays.css';
import frame109 from '../imgs/Frame 109.png';
import frame110 from '../imgs/Frame 110.png';
import frame111 from '../imgs/Frame 111.png';
import frame112 from '../imgs/Frame 112.png';

const AllStays = () => {
  const navigate = useNavigate();
  const stays = [
    { id: 1, title: 'Gouna Haven', location: 'Red Sea', img: frame109 },
    { id: 2, title: 'Fouka Bay Resort', location: 'North Coast', img: frame110 },
    { id: 3, title: 'Mountain View Penthouse', location: 'Ras El Hikma', img: frame111 },
    { id: 4, title: 'Almaza Bay Luxury', location: 'Marsa Matrouh', img: frame112 },
    { id: 5, title: 'Seaside Sanctuary', location: 'North Coast', img: frame110 },
    { id: 6, title: 'The Azure Suite', location: 'Gouna', img: frame109 },
  ];

  return (
    <div className="all-stays-page">
      <button className="back-btn-global" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <section className="all-stays-content">
        <h1 className="libre section-title">Explore All Stays</h1>
        <div className="stays-grid-container">
          {stays.map(stay => (
            <div key={stay.id} className="stay-card-v2" onClick={() => navigate('/stays')}>
              <div className="stay-img-box">
                <img src={stay.img} alt={stay.title} />
              </div>
              <div className="stay-info-box">
                <h3 className="libre">{stay.title}</h3>
                <p className="encode">{stay.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AllStays;