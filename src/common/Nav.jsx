import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCMS } from '../useCMS';
import logo from '../imgs/logo.png';
import './Nav.css';

const DEFAULT_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/AboutUs' },
  { label: 'Stays', href: '/stays' },
  { label: 'Contact', href: '/contactus' },
];

const Nav = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const cms = useCMS('global_nav', {});
    const navLinks = (cms.links && cms.links.length > 0) ? cms.links : DEFAULT_LINKS;
    const ctaText = cms.ctaText || 'Book Now';
    const ctaHref = cms.ctaHref || '/stays';
    const logoSrc = cms.logoUrl || logo;

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

    // Close menu when tapping outside on mobile
    useEffect(() => {
        if (!isOpen) return;
        const handleOutsideClick = () => setIsOpen(false);
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [isOpen]);

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
                        <Link to="/"><img src={logoSrc} alt="Logo" /></Link>
                    </div>
                </div>

                <div className={`nav-center ${isScrolled ? 'hide' : ''}`}>
                    <div className="nav-links">
                        {navLinks.map((l) => (
                            <Link key={l.href} to={l.href}>{l.label}</Link>
                        ))}
                    </div>
                </div>

                <div className="nav-right">
                    <div className={`nav-actions ${isScrolled ? 'hide' : ''}`}>
                        <Link to={ctaHref}>
                            <button className="book-btn">{ctaText}</button>
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
                        onMouseEnter={() => { if (window.matchMedia('(hover: hover)').matches) setIsOpen(true); }}
                        onMouseLeave={() => { if (window.matchMedia('(hover: hover)').matches) setIsOpen(false); }}
                    >
                        <div
                            className="hamburger-container"
                            onClick={(e) => { e.stopPropagation(); setIsOpen(prev => !prev); }}
                        >
                            <div className={`burger-lines ${isOpen ? 'open' : ''}`}>
                                <span></span><span></span><span></span>
                            </div>
                        </div>

                        <div className={`dropdown-panel ${isOpen ? 'active' : ''}`}>
                            <div className="dropdown-links">
                                {navLinks.map((l) => (
                                    <Link key={l.href} to={l.href} onClick={closeMenu}>{l.label}</Link>
                                ))}
                            </div>
                            <div className="dropdown-actions">
                                <Link to={ctaHref} onClick={closeMenu}><button className="book-btn">{ctaText}</button></Link>
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