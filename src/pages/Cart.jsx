import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import frame125 from '../imgs/Frame 125.png';

const Cart = () => {
  const navigate = useNavigate();
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [services, setServices] = useState({
    breakfast: false,
    airport: false,
    spa: false
  });

  const toggleService = (service) => {
    setServices(prev => ({ ...prev, [service]: !prev[service] }));
  };

  const basePrice = 840;
  const serviceTotal = (services.breakfast ? 50 : 0) + (services.airport ? 100 : 0) + (services.spa ? 150 : 0);
  const finalTotal = basePrice + serviceTotal;

  return (
    <div className="cart-page">
      <button className="back-btn-global" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Property
      </button>

      <div className="cart-container">
        <div className="cart-main">
          <h1 className="libre">Your Selection</h1>
          
          <div className="cart-item-large">
            <div className="cart-item-img">
              <img src={frame125} alt="Property" />
            </div>
            <div className="cart-item-info">
              <h2 className="libre">Executive Ocean Suite</h2>
              <p className="encode location-tag">North Coast, Egypt</p>
              <p className="encode stay-dates">Oct 12, 2023 - Oct 15, 2023 (3 Nights)</p>
              
              <div className="selection-adjusters">
                <div className="adjuster-group">
                  <label className="encode">Adults</label>
                  <div className="counter-controls">
                    <span>{adults}</span>
                  </div>
                </div>
                <div className="adjuster-group">
                  <label className="encode">Rooms</label>
                  <div className="counter-controls">
                    <span>{rooms}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="additional-services">
            <h3 className="libre">Enhance Your Stay</h3>
            <div className="services-list">
              <div className={`service-option ${services.breakfast ? 'selected' : ''}`} onClick={() => toggleService('breakfast')}>
                <div className="service-details">
                  <span className="encode service-name">Daily Gourmet Breakfast</span>
                  <span className="encode service-price">+$50</span>
                </div>
                <div className="custom-checkbox"></div>
              </div>

              <div className={`service-option ${services.airport ? 'selected' : ''}`} onClick={() => toggleService('airport')}>
                <div className="service-details">
                  <span className="encode service-name">Private Airport Transfer</span>
                  <span className="encode service-price">+$100</span>
                </div>
                <div className="custom-checkbox"></div>
              </div>

              <div className={`service-option ${services.spa ? 'selected' : ''}`} onClick={() => toggleService('spa')}>
                <div className="service-details">
                  <span className="encode service-name">Full Spa Access</span>
                  <span className="encode service-price">+$150</span>
                </div>
                <div className="custom-checkbox"></div>
              </div>
            </div>
          </div>
        </div>

        <aside className="cart-summary">
          <div className="summary-sticky">
            <h3 className="encode summary-title">Payment Summary</h3>
            <div className="summary-row">
              <span>Base Stay ({rooms} Room)</span>
              <span>${basePrice}</span>
            </div>
            <div className="summary-row">
              <span>Additional Services</span>
              <span>${serviceTotal}</span>
            </div>
            <div className="summary-total-row libre">
              <span>Total Amount</span>
              <span>${finalTotal}</span>
            </div>
            <button className="cart-proceed-btn encode" onClick={() => navigate('/checkout')}>
              Continue to Checkout
            </button>
            <p className="encode vat-text">Inclusive of all taxes and fees</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;