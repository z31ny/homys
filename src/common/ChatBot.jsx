import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../imgs/logo.png';
import './ChatBot.css';

const ChatBot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  
  const initialMessage = { id: 1, type: 'bot', text: 'Welcome to Homys! I am your virtual assistant. How can I help you today?' };
  const [messages, setMessages] = useState([initialMessage]);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showContactForm]);

  const handleResetAndClose = () => {
    setIsOpen(false);
    // Timeout to allow the closing animation to finish before resetting state
    setTimeout(() => {
      setMessages([initialMessage]);
      setShowContactForm(false);
    }, 400);
  };

  const handleOptionClick = (option) => {
    const userMsg = { id: Date.now(), type: 'user', text: option };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      let botResponse = "";
      let showNav = false;
      
      if (option === "Stays") {
        botResponse = "Explore our premium collection. You can filter by view and see live pricing on our stays page.";
        showNav = "stays";
      } else if (option === "Story") {
        botResponse = "Homys is a desire to redefine modern living into a sanctuary. Want to learn more?";
        showNav = "about";
      } else if (option === "Support") {
        botResponse = "Our team is here 24/7. Visit our contact page or fill the form below.";
        showNav = "contact";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: botResponse, nav: showNav }]);
    }, 600);
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : 'closed'}`}>
      
      {/* Side Tab - Hidden when chat is open to fix alignment */}
      <div className="bot-side-tab" onClick={() => setIsOpen(true)}>
        <span className="tab-tooltip encode">Chat with bot</span>
        <div className="tab-icon">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </div>
      </div>

      {/* Main Chat Window */}
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
          {messages.map(msg => (
            <div key={msg.id} className="msg-box">
              <div className={`msg-bubble ${msg.type}`}>{msg.text}</div>
              {msg.nav && (
                <div className="bot-nav-row">
                  {msg.nav === 'stays' && <button onClick={() => navigate('/stays')}>Go to Stays</button>}
                  {msg.nav === 'about' && <button onClick={() => navigate('/AboutUs')}>About Us</button>}
                  {msg.nav === 'contact' && <button onClick={() => navigate('/contactus')}>Contact</button>}
                </div>
              )}
            </div>
          ))}
          {showContactForm && (
            <div className="form-container-animate">
              <form className="bot-lead-form" onSubmit={(e) => { e.preventDefault(); setShowContactForm(false); setMessages(prev => [...prev, {id: Date.now(), type:'bot', text:'We will contact you shortly.'}])}}>
                <input type="email" placeholder="Email Address" required />
                <input type="tel" placeholder="Phone Number" required />
                <button type="submit">Submit Request</button>
              </form>
              <button className="form-back-btn" onClick={() => setShowContactForm(false)}>← Back to options</button>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-footer">
          {!showContactForm && (
            <>
              <div className="quick-options">
                <button onClick={() => handleOptionClick("Stays")}>Stays</button>
                <button onClick={() => handleOptionClick("Story")}>Story</button>
                <button onClick={() => handleOptionClick("Support")}>Support</button>
              </div>
              <button className="human-req" onClick={() => setShowContactForm(true)}>Talk to a person</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBot;