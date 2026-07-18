import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Cart.css';

import fallbackImg from '../imgs/Frame 125.png';

const Cart = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    propertyId,
    title = 'Property',
    locationName = '',
    heroImageUrl,
    pricePerNight = 0,
    checkIn = '',
    checkOut = '',
    nights = 0,
    numGuests = 1,
    basePrice = 0,
    offersHousekeeping = false,
    offersBeachAccess = false,
    beachAccessPrice = 2000,
    serviceFeePercent = 10,
  } = state || {};

  const handleContinue = () => {
    if (!propertyId) {
      navigate('/stays');
      return;
    }
    navigate('/checkout', {
      state: {
        propertyId,
        title,
        locationName,
        heroImageUrl,
        pricePerNight,
        checkIn,
        checkOut,
        nights,
        numGuests,
        basePrice,
        offersHousekeeping,
        offersBeachAccess,
        beachAccessPrice,
        serviceFeePercent,
      },
    });
  };

  if (!state?.propertyId) {
    return (
      <div className="cart-page" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h2>No booking selected</h2>
        <p style={{ opacity: 0.6, margin: '16px 0 32px' }}>Please select a property and choose your dates first.</p>
        <button className="cart-proceed-btn encode" onClick={() => navigate('/stays')}>Browse Stays</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <button className="back-btn-global" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Property
      </button>

      <div className="cart-container">
        <div className="cart-main">
          <h1 className="libre">Your Selection</h1>

          <div className="cart-item-large">
            <div className="cart-item-img">
              <img
                src={heroImageUrl || fallbackImg}
                alt={title}
                onError={(e) => { e.target.src = fallbackImg; }}
              />
            </div>
            <div className="cart-item-info">
              <h2 className="libre">{title}</h2>
              <p className="encode location-tag">{locationName}</p>
              <p className="encode stay-dates">
                {checkIn} — {checkOut} ({nights} Night{nights !== 1 ? 's' : ''})
              </p>
              <div className="selection-adjusters">
                <div className="adjuster-group">
                  <label className="encode">Guests</label>
                  <div className="counter-controls"><span>{numGuests}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="cart-summary">
          <div className="summary-sticky">
            <h3 className="encode summary-title">Payment Summary</h3>
            <div className="summary-row">
              <span>EGP {pricePerNight}/night × {nights} night{nights !== 1 ? 's' : ''}</span>
              <span>EGP {basePrice.toFixed(2)}</span>
            </div>
            <div className="summary-total-row libre">
              <span>Subtotal</span>
              <span>EGP {basePrice.toFixed(2)}</span>
            </div>
            <button className="cart-proceed-btn encode" onClick={handleContinue}>
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
