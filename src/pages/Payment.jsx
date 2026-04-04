import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState('card');

  return (
    <div className="payment-page">
      <button className="back-btn-global" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <div className="payment-content-wrapper">
        <h1 className="libre">Payment Method</h1>
        
        <div className="payment-methods-row">
          <button 
            className={`method-pill ${method === 'card' ? 'active' : ''}`} 
            onClick={() => setMethod('card')}
          >
            Credit Card
          </button>
          <button 
            className={`method-pill ${method === 'paypal' ? 'active' : ''}`} 
            onClick={() => setMethod('paypal')}
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

          <button type="button" className="final-pay-btn encode" onClick={() => navigate('/success')}>
            Complete Payment — $880
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;