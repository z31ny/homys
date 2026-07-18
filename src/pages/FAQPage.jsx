import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMS } from '../useCMS';
import { contactAPI } from '../services/api';
import './FAQPage.css';

const DEFAULTS = {
  title: 'Frequently Asked Questions',
  ctaTitle: 'Still have questions?',
  ctaSubtitle: 'Leave your inquiry below and our team will get back to you shortly.',
  items: [
    { id: '01', question: 'How do I book a property?',           answer: 'You can book directly through our stays page by selecting a property and following the checkout process.' },
    { id: '02', question: 'What is the cancellation policy?',    answer: 'Cancellations are free up to 48 hours before your arrival date for most properties.' },
    { id: '03', question: 'Are pets allowed in the units?',      answer: 'Pet policies vary by property. Please check the specific property details or contact support.' },
    { id: '04', question: 'Is there a minimum stay requirement?', answer: 'Most of our sanctuary homes require a minimum stay of 2 nights.' },
    { id: '05', question: 'Do you offer airport transfers?',      answer: 'Yes, premium airport transfers can be added to your booking during the cart process.' },
  ],
};

const FAQPage = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);
  const c = useCMS('faq_page', DEFAULTS);
  const faqs = c.items?.length ? c.items : DEFAULTS.items;

  // Inquiry form state
  const [inquiryEmail,   setInquiryEmail]   = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError,   setInquiryError]   = useState('');

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryEmail || !inquiryMessage) {
      setInquiryError('Please fill in your email and question.');
      return;
    }
    setInquiryLoading(true);
    setInquiryError('');
    try {
      await contactAPI.submit({ name: 'FAQ Inquiry', email: inquiryEmail, message: inquiryMessage });
      setInquirySuccess(true);
      setInquiryEmail('');
      setInquiryMessage('');
    } catch (err) {
      setInquiryError(err.message || 'Failed to send. Please try again.');
    } finally {
      setInquiryLoading(false);
    }
  };

  return (
    <div className="faq-page-container">
      <button className="back-btn-global" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>

      <section className="faq-content-section">
        <h1 className="libre main-title">{c.title}</h1>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={faq.id ?? index}
              className={`faq-row ${activeIndex === index ? 'active' : ''}`}
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}>
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
          <h2 className="libre">{c.ctaTitle}</h2>
          <p className="encode">{c.ctaSubtitle}</p>
          {inquirySuccess ? (
            <div style={{ padding: '20px 24px', background: '#e8f5e9', borderRadius: 12, textAlign: 'center' }}>
              <p className="encode" style={{ color: '#2e7d32', fontWeight: 700 }}>✓ Your question has been sent! We'll get back to you shortly.</p>
              <button className="submit-inquiry-btn encode" style={{ marginTop: 16 }} onClick={() => setInquirySuccess(false)}>
                Ask Another Question
              </button>
            </div>
          ) : (
            <form className="ask-form" onSubmit={handleInquirySubmit}>
              <input
                type="email"
                placeholder="Your Email Address"
                className="encode"
                value={inquiryEmail}
                onChange={(e) => setInquiryEmail(e.target.value)}
                required
              />
              <textarea
                placeholder="Write your question here..."
                className="encode"
                rows="4"
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                required
              />
              {inquiryError && (
                <p style={{ color: '#c0392b', fontWeight: 700, fontSize: '0.88rem', margin: '0' }} className="encode">
                  {inquiryError}
                </p>
              )}
              <button type="submit" className="submit-inquiry-btn encode" disabled={inquiryLoading}>
                {inquiryLoading ? 'Sending…' : 'Submit Inquiry'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
