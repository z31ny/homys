import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BookNow.css';
import rect6 from '../imgs/Rectangle 6.png';
import rect9 from '../imgs/Rectangle 9.png';
import rect10 from '../imgs/Rectangle 10.png';
import rect11 from '../imgs/Rectangle 11.png';

const BookNow = () => {
  const navigate = useNavigate();

  const locations = [
    { name: 'Sahel', img: rect6, desc: 'North Coast Sanctuaries' },
    { name: 'Cairo', img: rect9, desc: 'Urban Luxury Lofts' },
    { name: 'Gouna', img: rect10, desc: 'Lagoon Front Villas' },
    { name: 'Red Sea', img: rect11, desc: 'Crystal Water Escapes' }
  ];

  return (
    <div className="book-now-page">
      <header className="book-header">
        <h1 className="libre">Plan Your Next Escape</h1>
        <p className="encode">Select a destination to discover our hand-picked collection of homes.</p>
      </header>

      <section className="booking-filter-bar">
        <div className="filter-item">
          <label className="encode">Destination</label>
          <select className="encode">
            <option>All Locations</option>
            <option>Sahel, North Coast</option>
            <option>New Cairo</option>
            <option>El Gouna</option>
          </select>
        </div>
        <div className="filter-item">
          <label className="encode">Check In - Out</label>
          <input type="text" placeholder="Select Dates" className="encode" />
        </div>
        <button className="search-stays-btn encode" onClick={() => navigate('/stays')}>Search Availability</button>
      </section>

      <section className="location-selection-grid">
        {locations.map((loc, idx) => (
          <div key={idx} className="location-card" onClick={() => navigate('/stays')}>
            <div className="loc-img-wrap">
              <img src={loc.img} alt={loc.name} />
              <div className="loc-overlay">
                <h3 className="libre">{loc.name}</h3>
                <span className="encode">{loc.desc}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="special-offers">
        <h2 className="libre">Seasonal Offers</h2>
        <div className="offers-container">
          <div className="offer-pill">
            <div className="pill-content">
              <span className="encode tag">Early Bird</span>
              <h4 className="libre">Save 20% on Summer Stays</h4>
              <p className="encode">Book 3 months in advance at any Sahel property.</p>
            </div>
          </div>
          <div className="offer-pill">
            <div className="pill-content">
              <span className="encode tag">Extended Stay</span>
              <h4 className="libre">Weekly Sanctuary Discount</h4>
              <p className="encode">Stay 7+ nights and get your last night on us.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookNow;