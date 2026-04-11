import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookNow.css';
import rect6 from '../imgs/Rectangle 6.png';
import rect9 from '../imgs/Rectangle 9.png';
import rect10 from '../imgs/Rectangle 10.png';
import rect11 from '../imgs/Rectangle 11.png';

const BookNow = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const locations = [
    { name: 'Sahel', img: rect6, desc: 'North Coast Sanctuaries' },
    { name: 'Cairo', img: rect9, desc: 'Urban Luxury Lofts' },
    { name: 'Gouna', img: rect10, desc: 'Lagoon Front Villas' },
    { name: 'Red Sea', img: rect11, desc: 'Crystal Water Escapes' }
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set('location', destination);
    navigate(`/all-stays${params.toString() ? `?${params}` : ''}`);
  };

  const handleLocationClick = (locName) => {
    navigate(`/all-stays?location=${encodeURIComponent(locName)}`);
  };

  return (
    <div className="book-now-page">
      <header className="book-header">
        <h1 className="libre">Plan Your Next Escape</h1>
        <p className="encode">Select a destination to discover our hand-picked collection of homes.</p>
      </header>

      <section className="booking-filter-bar">
        <div className="filter-item">
          <label className="encode">Destination</label>
          <select className="encode" value={destination} onChange={(e) => setDestination(e.target.value)}>
            <option value="">All Locations</option>
            <option value="Sahel">Sahel, North Coast</option>
            <option value="Cairo">New Cairo</option>
            <option value="Gouna">El Gouna</option>
            <option value="Red Sea">Red Sea</option>
          </select>
        </div>
        <div className="filter-item">
          <label className="encode">Check In</label>
          <input
            type="date"
            className="encode"
            value={checkIn}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>
        <div className="filter-item">
          <label className="encode">Check Out</label>
          <input
            type="date"
            className="encode"
            value={checkOut}
            min={checkIn || new Date().toISOString().split('T')[0]}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
        <button className="search-stays-btn encode" onClick={handleSearch}>Search Availability</button>
      </section>

      <section className="location-selection-grid">
        {locations.map((loc, idx) => (
          <div key={idx} className="location-card" onClick={() => handleLocationClick(loc.name)}>
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