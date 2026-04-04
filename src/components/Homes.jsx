import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Homes.css';

import frame125 from '../imgs/Frame 125.png';
import frame125_1 from '../imgs/Frame 125-1.png';
import frame130 from '../imgs/Frame 130.png';
import rect6 from '../imgs/Rectangle 6.png';
import rect9 from '../imgs/Rectangle 9.png';
import rect10 from '../imgs/Rectangle 10.png';
import rect11 from '../imgs/Rectangle 11.png';

const HomeCard = ({ home }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate(); 

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === home.images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? home.images.length - 1 : prev - 1));
  };

  return (
    <div className="home-card">
      <div className="home-img-wrapper">
        <div 
          className="carousel-track" 
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {home.images.map((img, index) => (
            <img key={index} src={img} alt={home.title} className="home-main-img" />
          ))}
        </div>
        
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

        <div className="carousel-dots">
          {home.images.map((_, idx) => (
            <span key={idx} className={`dot ${currentIndex === idx ? 'active' : ''}`} />
          ))}
        </div>

       <button className="check-house-btn" onClick={() => navigate('/propertydetails')}>
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
          {home.location}
        </div>

        <div className="home-specs">
          <div className="spec-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 20v-8a2 2 0 012-2h16a2 2 0 012 2v8M4 10V6a2 2 0 012-2h12a2 2 0 012 2v4M2 12h20M7 7v3M17 7v3" />
            </svg>
            {home.beds}
          </div>
          <div className="spec-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 21h10M9 21v-2a2 2 0 012-2h2a2 2 0 012 2v2M3 7h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z" />
            </svg>
            {home.baths}
          </div>
          <div className="spec-item">{home.sqft}</div>
        </div>

        <div className="home-price">{home.price}</div>
      </div>
    </div>
  );
};

const Homes = () => {
  const navigate = useNavigate(); 

  const propertyData = [
    { id: 1, images: [frame125, rect6, rect9, rect10], title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$2,500/month' },
    { id: 2, images: [frame130, rect11, rect6, rect9], title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$3,500/month' },
    { id: 3, images: [frame125_1, rect10, rect11, rect6], title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$2,900/month' },
    { id: 4, images: [rect6, frame125, rect9, rect10], title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$2,500/month' },
    { id: 5, images: [rect9, frame130, rect11, rect6], title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$2,500/month' },
    { id: 6, images: [rect10, frame125_1, rect11, rect9], title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$2,500/month' },
    { id: 7, images: [rect11, rect6, frame125, rect10], title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$2,500/month' },
    { id: 8, images: [frame130, rect9, rect10, rect11], title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$2,500/month' },
    { id: 9, images: [rect6, rect9, rect10, frame125_1], title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$2,500/month' },
  ];

  return (
    <section className="homes-section">
      <h2 className="homes-count-title">356 Homes</h2>
      <div className="homes-grid">
        {propertyData.map((home) => (
          <HomeCard key={home.id} home={home} />
        ))}
      </div>
      
      <button className="explore-more-homes" onClick={() => navigate('/MoreHomes')}>
        Explore More
      </button>
    </section>
  );
};

export default Homes;