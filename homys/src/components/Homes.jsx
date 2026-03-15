import React from 'react';
import './Homes.css';
import frame125 from '../imgs/Frame 125.png';
import frame125_1 from '../imgs/Frame 125-1.png';
import frame130 from '../imgs/Frame 130.png';

const Homes = () => {
  const propertyData = [
    { id: 1, img: frame125, title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$2,500/month' },
    { id: 2, img: frame130, title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$3,500/month' },
    { id: 3, img: frame125_1, title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$2,900/month' },
    { id: 4, img: frame125, title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$2,500/month' },
    { id: 5, img: frame130, title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$2,500/month' },
    { id: 6, img: frame125_1, title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$2,500/month' },
    { id: 7, img: frame125, title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$2,500/month' },
    { id: 8, img: frame130, title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$2,500/month' },
    { id: 9, img: frame125_1, title: 'Modern Downtown Apartment', location: 'Downtown, New York', beds: 2, baths: 2, sqft: '1200 sqft', price: '$2,500/month' },
  ];

  return (
    <section className="homes-section">
      <h2 className="homes-count-title">356 Homes</h2>
      
      <div className="homes-grid">
        {propertyData.map((home) => (
          <div key={home.id} className="home-card">
            <div className="home-img-wrapper">
              <img src={home.img} alt={home.title} className="home-main-img" />
              <button className="check-house-btn">Check Out House</button>
            </div>
            
            <div className="home-card-content">
              <h3 className="home-title">{home.title}</h3>
              <div className="home-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {home.location}
              </div>
              
              <div className="home-specs">
                <div className="spec-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 20v-8a2 2 0 012-2h16a2 2 0 012 2v8M4 10V6a2 2 0 012-2h12a2 2 0 012 2v4M2 12h20M7 7v3M17 7v3" /></svg>
                  {home.beds}
                </div>
                <div className="spec-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 21h10M9 21v-2a2 2 0 012-2h2a2 2 0 012 2v2M3 7h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z" /></svg>
                  {home.baths}
                </div>
                <div className="spec-item">{home.sqft}</div>
              </div>
              
              <div className="home-price">{home.price}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="explore-more-homes">Explore More</button>
    </section>
  );
};

export default Homes;