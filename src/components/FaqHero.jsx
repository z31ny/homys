import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FaqHero.css';

const FaqHero = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();

  const faqs = [
    { id: '01', question: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit ?', answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.' },
    { id: '02', question: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit ?', answer: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
    { id: '03', question: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit ?', answer: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
    { id: '04', question: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit ?', answer: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <h2 className="faq-title">FAQS</h2>
      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div 
            key={faq.id} 
            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
            onClick={() => toggleAccordion(index)}
          >
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
              <div className="faq-answer">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="show-more-btn" onClick={() => navigate('/faq-page')}>
        Show More
      </button>
    </section>
  );
};

export default FaqHero;