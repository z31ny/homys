import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';
import frame125 from '../imgs/Frame 125.png';

const Checkout = () => {
  const navigate = useNavigate();

  return (
    <div className="checkout-page">
      <button className="back-btn-global" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <div className="checkout-container">
        <div className="checkout-left">
          <h1 className="libre">Confirm Your Stay</h1>
          <form className="checkout-form">
            <h3 className="encode section-label">Guest Information</h3>
            <div className="input-grid">
              <input type="text" placeholder="First Name" className="encode" />
              <input type="text" placeholder="Last Name" className="encode" />
            </div>
            <input type="email" placeholder="Email Address" className="encode" />
            <input type="tel" placeholder="Phone Number" className="encode" />
            
            <h3 className="encode section-label" style={{marginTop: '40px'}}>Special Requests</h3>
            <textarea className="encode" placeholder="Anything we should know?"></textarea>
          </form>
        </div>

        <aside className="checkout-right">
          <div className="summary-card">
            <div className="summary-img">
              <img src={frame125} alt="Property" />
            </div>
            <div className="summary-details">
              <h4 className="libre">Executive Ocean Suite</h4>
              <p className="encode">Oct 12, 2023 - Oct 15, 2023</p>
              <div className="price-line">
                <span>$280 x 3 nights</span>
                <span>$840</span>
              </div>
              <div className="price-line">
                <span>Service Fee</span>
                <span>$40</span>
              </div>
              <div className="total-line libre">
                <span>Total</span>
                <span>$880</span>
              </div>
              <button className="proceed-btn encode" onClick={() => navigate('/payment')}>
                Proceed to Payment
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;