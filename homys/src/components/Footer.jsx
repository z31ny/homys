import React from 'react';
import './Footer.css';
import logo from '../imgs/logowhite.png';
import footer from '../imgs/footer.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        <div className="footer-top">
          <div className="footer-logo-section">
            <img src={logo} alt="HOMYS Logo" className="footer-logo" />
          </div>

          <div className="footer-links-grid">
            <div className="footer-column">
              <h3>Catalog</h3>
              <ul>
                <li><a href="/">ESWT</a></li>
                <li><a href="/">HILT</a></li>
                <li><a href="/">Skin IQ</a></li>
                <li><a href="/">Rehab Simulators</a></li>
                <li><a href="/">EECP</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Services</h3>
              <ul>
                <li><a href="/">Leasing</a></li>
                <li><a href="/">Consultation</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>About</h3>
              <ul>
                <li><a href="/">About Us</a></li>
                <li><a href="/">News</a></li>
                <li><a href="/">Partners</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-cta">
            <button className="get-touch-btn">Get In Touch</button>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-socials">
            <div className="social-icon">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </div>
            <div className="social-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </div>
          </div>

          <div className="footer-contact">
            <p>+7 (411) 390-51-11</p>
            <p>Homys@managment.com</p>
          </div>

          <div className="footer-copyright">
            <p>© 2021 — Homys<br/>All Rights Reserved</p>
          </div>
        </div>
      </div>

      <div 
        className="footer-texture" 
        style={{ backgroundImage: `url(${footer})` }}
      ></div>
    </footer>
  );
};

export default Footer;