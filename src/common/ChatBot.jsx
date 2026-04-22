import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactAPI } from '../services/api';
import logo from '../imgs/logo.png';
import './ChatBot.css';

const INITIAL_MESSAGE = {
  id: 1,
  type: 'bot',
  text: 'Welcome to Homys! I am your virtual assistant. How can I help you today?',
};

const ChatBot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);

  // Contact form state
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showContactForm]);

  const handleResetAndClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setMessages([INITIAL_MESSAGE]);
      setShowContactForm(false);
      setContactEmail('');
      setContactPhone('');
      setContactMsg('');
      setFormError('');
    }, 400);
  };

  const addBotMessage = (text, nav = null) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'bot', text, nav },
    ]);
  };

  const handleOptionClick = (option) => {
    setMessages((prev) => [...prev, { id: Date.now(), type: 'user', text: option }]);

    setTimeout(() => {
      if (option === 'Stays') {
        addBotMessage(
          'Explore our premium collection. Filter by view, price, and location on our stays page.',
          'stays'
        );
      } else if (option === 'Story') {
        addBotMessage(
          'Homys is a desire to redefine modern living into a sanctuary. Learn more about us.',
          'about'
        );
      } else if (option === 'Support') {
        addBotMessage(
          'Our team is here to help. Visit our contact page or fill the quick form below.',
          'contact'
        );
      }
    }, 600);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!contactEmail.trim()) {
      setFormError('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    try {
      await contactAPI.submit({
        name: 'Chat Inquiry',
        email: contactEmail.trim(),
        phone: contactPhone.trim() || undefined,
        message: contactMsg.trim() || `Contact request from chatbot. Email: ${contactEmail}`,
      });

      setShowContactForm(false);
      setContactEmail('');
      setContactPhone('');
      setContactMsg('');
      addBotMessage(
        "Your request has been sent! Our team will reach out to you at " +
          contactEmail +
          " shortly."
      );
    } catch (err) {
      setFormError(err.message || 'Failed to send. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : 'closed'}`}>
      {/* Side Tab */}
      <div className="bot-side-tab" onClick={() => setIsOpen(true)}>
        <span className="tab-tooltip encode">Chat with bot</span>
        <div className="tab-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </div>
      </div>

      {/* Chat Window */}
      <div className="chat-window">
        <div className="chat-header">
          <div className="bot-brand">
            <div className="brand-logo-wrap">
              <img src={logo} alt="Logo" />
            </div>
            <div className="brand-info">
              <h4 className="libre">Homys Bot</h4>
              <span className="online-indicator">Online Assistant</span>
            </div>
          </div>
          <div className="header-btns">
            <button className="h-btn" onClick={() => setIsOpen(false)}>—</button>
            <button className="h-btn close-x" onClick={handleResetAndClose}>✕</button>
          </div>
        </div>

        <div className="chat-body">
          {messages.map((msg) => (
            <div key={msg.id} className="msg-box">
              <div className={`msg-bubble ${msg.type}`}>{msg.text}</div>
              {msg.nav && (
                <div className="bot-nav-row">
                  {msg.nav === 'stays' && (
                    <button onClick={() => navigate('/stays')}>Go to Stays</button>
                  )}
                  {msg.nav === 'about' && (
                    <button onClick={() => navigate('/aboutus')}>About Us</button>
                  )}
                  {msg.nav === 'contact' && (
                    <button onClick={() => navigate('/contactus')}>Contact Page</button>
                  )}
                </div>
              )}
            </div>
          ))}

          {showContactForm && (
            <div className="form-container-animate">
              <form className="bot-lead-form" onSubmit={handleContactSubmit}>
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
                <textarea
                  placeholder="What can we help you with? (optional)"
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  rows={3}
                  style={{ resize: 'none', fontFamily: 'inherit', fontSize: '0.85rem', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                />
                {formError && (
                  <p style={{ color: '#c0392b', fontSize: '0.8rem', margin: '4px 0' }}>{formError}</p>
                )}
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Submit Request'}
                </button>
              </form>
              <button
                className="form-back-btn"
                onClick={() => { setShowContactForm(false); setFormError(''); }}
              >
                ← Back to options
              </button>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="chat-footer">
          {!showContactForm && (
            <>
              <div className="quick-options">
                <button onClick={() => handleOptionClick('Stays')}>Stays</button>
                <button onClick={() => handleOptionClick('Story')}>Story</button>
                <button onClick={() => handleOptionClick('Support')}>Support</button>
              </div>
              <button className="human-req" onClick={() => setShowContactForm(true)}>
                Talk to a person
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
