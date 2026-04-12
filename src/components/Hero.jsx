import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';
const heroImg = 'https://res.cloudinary.com/dzpswgjsm/image/upload/f_auto,q_auto,w_1920/homys-static/hero.png';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="hero-bg" style={{ backgroundImage: `url(${heroImg})` }}>
        
        <div className="list-property-btn" onClick={() => navigate('/list-property')}>
          <span className="hover-text">List your property</span>
          <div className="icon-box">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
        </div>

        <div className="booking-bar">
          <div className="booking-item">
            <div className="item-label">
              <svg className="white-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <h3>Location</h3>
            </div>
            <p className="item-sub">Where are you staying?</p>
            <input type="text" placeholder="Enter destination..." className="hover-input" />
          </div>

          <div className="booking-item">
            <div className="item-label">
              <svg className="white-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <h3>Check In</h3>
            </div>
            <p className="item-sub">Select date</p>
            <input type="date" className="hover-input" />
          </div>

          <div className="booking-item">
            <div className="item-label">
              <svg className="white-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <h3>Check Out</h3>
            </div>
            <p className="item-sub">Select date</p>
            <input type="date" className="hover-input" />
          </div>

          <div className="booking-item">
            <div className="item-label">
              <svg className="white-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <h3>Guests</h3>
            </div>
            <p className="item-sub">Who's coming?</p>
            <select className="hover-input">
              <option value="">Select Guests</option>
              <option>1 Guest</option>
              <option>2 Guests</option>
              <option>3+ Guests</option>
            </select>
          </div>

          <button className="search-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;