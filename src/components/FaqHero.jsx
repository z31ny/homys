import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMS } from '../useCMS';
import './FaqHero.css';

const DEFAULTS = {
  sectionTitle: 'FAQs',
  showMoreButtonText: 'Show More',
  items: [
    { id: '01', question: 'What makes Homys different from regular rentals?', answer: 'Homys properties are professionally managed, rigorously inspected, and prepared with hotel-grade attention to detail.' },
    { id: '02', question: 'How do I book a Homys property?', answer: 'Browse our stays page, choose your property, select dates, and follow the checkout process.' },
    { id: '03', question: 'Can I list my property on Homys?', answer: "Yes! Click 'List Your Property' and submit your details for review." },
    { id: '04', question: 'Do you offer both short stays and longer rentals?', answer: 'We offer flexible options — from weekend escapes to extended monthly stays.' },
  ],
};

const FaqHero = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();
  const c = useCMS('home_faq', DEFAULTS);
  const faqs = c.items?.length ? c.items : DEFAULTS.items;

  return (
    <section className="faq-section">
      <h2 className="faq-title">{c.sectionTitle || 'FAQs'}</h2>
      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div key={faq.id ?? index}
            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}>
            <div className="faq-question-row">
              <span className="faq-number">{faq.id}</span>
              <p className="faq-question">{faq.question}</p>
              <span className={`faq-icon ${activeIndex === index ? 'rotate' : ''}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
            <div className="faq-answer-wrapper">
              <div className="faq-answer">{faq.answer}</div>
            </div>
          </div>
        ))}
      </div>
      <button className="show-more-btn" onClick={() => navigate('/faq-page')}>
        {c.showMoreButtonText || 'Show More'}
      </button>
    </section>
  );
};

export default FaqHero;
