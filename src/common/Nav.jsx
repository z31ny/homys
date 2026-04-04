import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../imgs/logo.png';
import './Nav.css';

const Nav = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsOpen(false);
            
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const closeMenu = () => setIsOpen(false);

    // Dynamic link — show Profile if logged in, Login if not
    const profileLink = isAuthenticated ? '/profile' : '/login';
    const profileLabel = isAuthenticated ? 'Profile' : 'Login';

    return (
        <nav className={`nav-wrapper ${isScrolled ? 'scrolled' : ''}`}>
            {/* TIER 1: Mode Switcher */}
            <div className="top-tier">
                <div className="mode-switcher">
                    <Link to="/" className={`mode-btn ${location.pathname !== '/furnish' ? 'active' : ''}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path></svg>
                        <span>Rent</span>
                    </Link>
                    <Link to="/furnish" className={`mode-btn ${location.pathname === '/furnish' ? 'active' : ''}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span>Furnish</span>
                    </Link>
                </div>
            </div>

            {/* TIER 2: Main Navigation */}
            <div className="main-tier">
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
                        <Link to={profileLink} className="profile-circle" title={profileLabel}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="user-icon">
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
                                <span></span><span></span><span></span>
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
                                <Link to="/booknow" onClick={closeMenu}><button className="book-btn">Book Now</button></Link>
                                <Link to={profileLink} onClick={closeMenu} className="profile-circle">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="user-icon">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Nav;