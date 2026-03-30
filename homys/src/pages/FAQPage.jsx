import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FAQPage.css';

const FAQPage = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    { id: '01', question: 'How do I book a property?', answer: 'You can book directly through our stays page by selecting a property and following the checkout process.' },
    { id: '02', question: 'What is the cancellation policy?', answer: 'Cancellations are free up to 48 hours before your arrival date for most properties.' },
    { id: '03', question: 'Are pets allowed in the units?', answer: 'Pet policies vary by property. Please check the specific property details or contact support.' },
    { id: '04', question: 'Is there a minimum stay requirement?', answer: 'Most of our sanctuary homes require a minimum stay of 2 nights.' },
    { id: '05', question: 'Do you offer airport transfers?', answer: 'Yes, premium airport transfers can be added to your booking during the cart process.' },
  ];

  return (
    <div className="faq-page-container">
      <button className="back-btn-global" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <section className="faq-content-section">
        <h1 className="libre main-title">Frequently Asked Questions</h1>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={faq.id} className={`faq-row ${activeIndex === index ? 'active' : ''}`} onClick={() => setActiveIndex(activeIndex === index ? null : index)}>
              <div className="faq-header-row">
                <span className="faq-num">{faq.id}</span>
                <p className="faq-q-text encode">{faq.question}</p>
                <div className="faq-arrow">↓</div>
              </div>
              <div className="faq-a-wrapper">
                <p className="faq-a-text encode">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="ask-question-box">
          <h2 className="libre">Still have questions?</h2>
          <p className="encode">Leave your inquiry below and our team will get back to you shortly.</p>
          <form className="ask-form">
            <input type="email" placeholder="Your Email Address" className="encode" />
            <textarea placeholder="Write your question here..." className="encode" rows="4"></textarea>
            <button type="button" className="submit-inquiry-btn encode">Submit Inquiry</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;