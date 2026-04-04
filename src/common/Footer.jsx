import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import logo from '../imgs/logowhite.png';
import footerBg from '../imgs/footer.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        <div className="footer-top">
          <div className="footer-logo-section">
            <Link to="/">
              <img src={logo} alt="HOMYS Logo" className="footer-logo" />
            </Link>
          </div>

          <div className="footer-links-grid">
            <div className="footer-column">
              <h3>Quick Links</h3>
              <ul>
                <li><Link to="/aboutus">About Us</Link></li>
                <li><Link to="/contactus">Contact Us</Link></li>
                <li><Link to="/stays">Stays</Link></li>
                <li><Link to="/faq-page">FAQS</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Services</h3>
              <ul>
                <li><Link to="/stays">Book a Stay</Link></li>
                <li><Link to="/list-property">List Property</Link></li>
                <li><Link to="/questionnaire">Personalized Quiz</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Support</h3>
              <ul>
                <li><Link to="/contactus">Help Center</Link></li>
                <li><Link to="/profile">My Account</Link></li>
                <li><Link to="/booknow">Special Offers</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-cta">
            <Link to="/contactus">
              <button className="get-touch-btn">Get In Touch</button>
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-socials">
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="social-icon">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="social-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://www.airbnb.com" target="_blank" rel="noreferrer" className="social-icon"><svg xmlns="http://www.w3.org/2000/svg" height="27" width="27" viewBox="0 0 640 640"><path fill="rgb(255, 255, 255)" d="M320.5 437.1C295.3 405.4 280.4 377.7 275.5 353.9C253 265.9 388.1 265.9 365.6 353.9C360.2 378.1 345.3 405.9 320.6 437.1L320.5 437.1zM458.7 510.3C416.6 528.6 375 499.4 339.4 459.8C443.3 329.7 385.5 259.8 320.6 259.8C265.7 259.8 235.4 306.3 247.3 360.3C254.2 389.5 272.5 422.7 301.7 459.8C269.2 495.8 241.2 512.5 216.5 514.7C166.5 522.1 127.4 473.6 145.2 423.6C160.3 384.4 256.9 192.4 261.1 182C276.9 151.9 286.7 124.6 320.5 124.6C352.8 124.6 363.9 150.5 380.9 184.5C416.9 255.1 470.3 362 495.7 423.6C508.9 456.7 494.3 494.9 458.7 510.2zM505.7 374.2C376.8 99.9 369.7 96 320.6 96C275.1 96 255.7 127.7 235.9 168.8C129.7 381.1 119.5 411.2 118.6 413.8C93.4 483.1 145.3 544 208.2 544C229.9 544 268.8 537.9 320.6 481.6C379.3 545.4 421.9 544 433 544C495.9 544.1 547.9 483.1 522.6 413.8C522.6 409.9 505.8 374.9 505.8 374.2L505.8 374.2z"/></svg></a>
          </div>

          <div className="footer-contact">
            <Link to="/contactus" className="contact-link"><p>+20 127 584 3440</p></Link>
            <Link to="/contactus" className="contact-link"><p>Homys@management.com</p></Link>
          </div>

          <div className="footer-copyright">
            <p>© 2021 — Homys<br/>All Rights Reserved</p>
          </div>
        </div>
      </div>

      <div 
        className="footer-texture" 
        style={{ backgroundImage: `url(${footerBg})` }}
      ></div>
    </footer>
  );
};

export default Footer;