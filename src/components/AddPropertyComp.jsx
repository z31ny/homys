import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AddPropertyComp.css';
import promoImg from '../imgs/Rectangle 11.png'; 

const AddPropertyComp = () => {
  const navigate = useNavigate();

  return (
    <section className="add-property-section">
      <div className="add-property-container">
        
        <div className="add-property-text">
          <span className="prop-tag encode">FOR PROPERTY OWNERS</span>
          <h2 className="libre">Turn your home into a premium sanctuary.</h2>
          <p className="encode">
            Join the Homys collection and reach global travelers looking for 
            exclusive stays. We handle the management, while you enjoy the returns 
            on your investment.
          </p>
          <ul className="prop-benefits encode">
            <li>✓ Full management & cleaning</li>
            <li>✓ 24/7 Guest communication</li>
            <li>✓ Optimized pricing for high returns</li>
          </ul>
          <button 
            className="list-now-btn encode" 
            onClick={() => navigate('/list-property')}
          >
            List Your Property
          </button>
        </div>

        <div className="add-property-visual">
          <div className="prop-img-wrapper">
            <img src={promoImg} alt="Luxury Interior" loading="lazy" />
            <div className="img-overlay-badge">
                <span className="libre">Join Us</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AddPropertyComp;