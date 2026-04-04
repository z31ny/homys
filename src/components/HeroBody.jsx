import React from 'react';
import './HeroBody.css';
import frame1 from '../imgs/Frame 1.png'; 
import frame2 from '../imgs/Frame 2.png';
import frame3 from '../imgs/Frame 3.png';

const HeroBody = () => {
  const services = [
    { id: 1, title: 'Hospitality', image: frame1 },
    { id: 2, title: 'Maintenance', image: frame2 },
    { id: 3, title: 'Experience', image: frame3 },
  ];

  return (
    <section className="services-section">
      <h1 className="background-text">SERVICES</h1>

      <div className="cards-container">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <div className="image-wrapper">
              <img src={service.image} alt={service.title} />
            </div>
            <h3 className="service-title">{service.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroBody;