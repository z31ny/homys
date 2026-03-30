import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../imgs/logo.png';
import './Nav.css';

const Nav = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0); // Track previous scroll position

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Close dropdown if it's open when scrolling
            setIsOpen(false);
            
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                // SCROLLING DOWN: Show Burger Menu
                setIsScrolled(true);
            } else {
                // SCROLLING UP: Show Normal Nav
                setIsScrolled(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]); // Depend on lastScrollY to calculate direction

    const closeMenu = () => setIsOpen(false);

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="nav-left">
                <div className="nav-logo">
                    <Link to="/"><img src={logo} alt="Logo" /></Link>
                </div>
            </div>

            <div className={`nav-center ${isScrolled ? 'hide' : ''}`}>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/AboutUs">About</Link>
                    <Link to="/stays">Stays</Link>
                    <Link to="/contactus">Contact</Link>
                </div>
            </div>

            <div className="nav-right">
                <div className={`nav-actions ${isScrolled ? 'hide' : ''}`}>
                    <Link to="/booknow">
                        <button className="book-btn">Book Now</button>
                    </Link>
                    
                    <Link to="/profile" className="profile-circle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="user-icon">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </Link>
                </div>

                <div 
                    className={`menu-hover-area ${isScrolled ? 'show' : ''}`}
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="hamburger-container">
                        <div className={`burger-lines ${isOpen ? 'open' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>

                    <div className={`dropdown-panel ${isOpen ? 'active' : ''}`}>
                        <div className="dropdown-links">
                            <Link to="/" onClick={closeMenu}>Home</Link>
                            <Link to="/AboutUs" onClick={closeMenu}>About</Link>
                            <Link to="/stays" onClick={closeMenu}>Stays</Link>
                            <Link to="/contactus" onClick={closeMenu}>Contact</Link>
                        </div>
                        <div className="dropdown-actions">
                            <Link to="/booknow" onClick={closeMenu}>
                                <button className="book-btn">Book Now</button>
                            </Link>
                            
                            <Link to="/profile" onClick={closeMenu} className="profile-circle">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="user-icon">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Nav;