import React, { useState } from 'react';
import logo from '../imgs/logo.png';
import './Nav.css';

const Nav = () => {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleMenu = () => {
      setIsOpen(!isOpen);
    };
  
    return ( 
            <nav className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="HOMYS Logo" />
      </div>


      <div className={`nav-links ${isOpen ? "active" : ""}`}>
        <a href="#home" className="nav-item" onClick={() => setIsOpen(false)}>Home</a>
        <a href="#about" className="nav-item" onClick={() => setIsOpen(false)}>About</a>
        <a href="#stays" className="nav-item" onClick={() => setIsOpen(false)}>Stays</a>
        <a href="#contact" className="nav-item" onClick={() => setIsOpen(false)}>Contact</a>
        
        <button className="book-btn mobile-only">Book Now</button>
      </div>

      <div className="nav-actions">
        <button className="book-btn desktop-only">Book Now</button>
        
        <div className="profile-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="user-icon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          {isOpen ? (
            <span className="close-icon">✕</span> 
          ) : (
            <>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </>
          )}
        </div>
      </div>
    </nav>
     );
}
 
export default Nav;