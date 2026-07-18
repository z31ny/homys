import React from 'react';
import { useCMS } from '../useCMS';
import { staticUrl } from '../staticAssets';
import './HeroBody.css';
const frame1 = staticUrl('Frame_1.png', 'f_auto,q_auto,w_600');
import frame2 from '../imgs/Frame 2.png';
import frame3 from '../imgs/Frame 3.png';

const FALLBACKS = [frame1, frame2, frame3];
const DEFAULTS = {
  sectionLabel: 'SERVICES',
  cards: [
    { id: 1, title: 'Hospitality', image: frame1 },
    { id: 2, title: 'Maintenance', image: '' },
    { id: 3, title: 'Experience',  image: '' },
  ],
};

const HeroBody = () => {
  const c = useCMS('home_services', DEFAULTS);
  const cards = c.cards?.length ? c.cards : DEFAULTS.cards;

  return (
    <section className="services-section">
      <h1 className="background-text">{c.sectionLabel || 'SERVICES'}</h1>
      <div className="cards-container">
        {cards.map((service, i) => (
          <div key={service.id ?? i} className="service-card">
            <div className="image-wrapper">
              <img src={service.image || FALLBACKS[i] || frame1} alt={service.title} />
            </div>
            <h3 className="service-title">{service.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroBody;
