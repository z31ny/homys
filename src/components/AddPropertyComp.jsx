import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMS } from '../useCMS';
import './AddPropertyComp.css';
import promoImg from '../imgs/Rectangle 11.png';

const DEFAULTS = {
  tag: 'FOR PROPERTY OWNERS',
  title: 'Turn your home into a premium sanctuary.',
  subtitle: 'Join the Homys collection and reach global travelers looking for exclusive stays. We handle the management, while you enjoy the returns on your investment.',
  benefits: [
    'Full management & cleaning',
    '24/7 Guest communication',
    'Optimized pricing for high returns',
  ],
  buttonText: 'List Your Property',
  image: '',
};

const AddPropertyComp = () => {
  const navigate = useNavigate();
  const c = useCMS('home_list_property', DEFAULTS);
  const benefits = Array.isArray(c.benefits) && c.benefits.length ? c.benefits : DEFAULTS.benefits;

  return (
    <section className="add-property-section">
      <div className="add-property-container">
        <div className="add-property-text">
          <span className="prop-tag encode">{c.tag}</span>
          <h2 className="libre">{c.title}</h2>
          <p className="encode">{c.subtitle}</p>
          <ul className="prop-benefits encode">
            {benefits.map((b, i) => <li key={i}>✓ {b}</li>)}
          </ul>
          <button className="list-now-btn encode" onClick={() => navigate('/list-property')}>
            {c.buttonText || 'List Your Property'}
          </button>
        </div>
        <div className="add-property-visual">
          <div className="prop-img-wrapper">
            <img src={c.image || promoImg} alt="Luxury Interior" loading="lazy" />
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
