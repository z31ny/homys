import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [method, setMethod] = useState('card');

  const {
    bookingId,
    title = 'Property',
    checkIn = '',
    checkOut = '',
    nights = 0,
    totalPrice = '0.00',
  } = state || {};

  // Guard: if navigated here directly without a booking
  if (!state?.bookingId) {
    return (
      <div className="payment-page" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h2>No booking to pay for</h2>
        <p style={{ opacity: 0.6, margin: '16px 0 32px' }}>
          Please complete the booking checkout first.
        </p>
        <button className="final-pay-btn encode" onClick={() => navigate('/stays')}>
          Browse Stays
        </button>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <button className="back-btn-global" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>

      <div className="payment-content-wrapper">
        <h1 className="libre">Payment Method</h1>

        <div style={{ marginBottom: 24, padding: '16px 20px', background: '#f0ece4', borderRadius: 12, fontSize: '0.9rem' }}>
          <p className="encode" style={{ margin: 0, opacity: 0.7 }}>
            <strong>{title}</strong> · {checkIn} — {checkOut}
          </p>
          <p className="encode" style={{ margin: '4px 0 0', fontWeight: 700, fontSize: '1.05rem' }}>
            Total: ${totalPrice}
          </p>
        </div>

        <div className="payment-methods-row">
          <button
            className={`method-pill ${method === 'card' ? 'active' : ''}`}
            onClick={() => setMethod('card')}
          >
            Credit Card
          </button>
          <button
            className={`method-pill ${method === 'paymob' ? 'active' : ''}`}
            onClick={() => setMethod('paymob')}
          >
            PayMob
          </button>
        </div>

        <form className="payment-large-form">
          <div className="pay-input-group">
            <label className="encode">Cardholder Name</label>
            <input type="text" placeholder="John Doe" className="encode" />
          </div>

          <div className="pay-input-group">
            <label className="encode">Card Number</label>
            <input type="text" placeholder="0000 0000 0000 0000" className="encode" />
          </div>

          <div className="pay-input-grid">
            <div className="pay-input-group">
              <label className="encode">Expiry Date</label>
              <input type="text" placeholder="MM/YY" className="encode" />
            </div>
            <div className="pay-input-group">
              <label className="encode">CVV</label>
              <input type="password" placeholder="***" className="encode" />
            </div>
          </div>

          <button
            type="button"
            className="final-pay-btn encode"
            onClick={() => navigate('/success', { state: { bookingId, totalPrice } })}
          >
            Complete Payment — ${totalPrice}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;