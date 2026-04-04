import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Success.css';

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="success-page">
      <div className="success-content">
        <div className="check-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h1 className="libre">Payment Successful</h1>
        <p className="encode">Your sanctuary awaits. A confirmation email has been sent to your inbox.</p>
        <div className="success-actions">
          <button className="cta-dark encode" onClick={() => navigate('/profile')}>Go to Profile</button>
          <button className="cta-light encode" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    </div>
  );
};

export default Success;