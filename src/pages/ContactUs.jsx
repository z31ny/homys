import React, { useState } from 'react';
import { contactAPI } from '../services/api';
import { useCMS } from '../useCMS';
import './ContactUs.css';

const DEFAULTS = {
  heroTitle: "Let's Connect",
  heroSubtitle: "Whether you have a question about our properties or need assistance, we're here to help.",
  formTitle: 'Send us a Message',
  office: 'North Coast, Egypt',
  email: 'Homys@management.com',
  phone: '+20 127 584 3440',
  workingHours: 'Sat - Thu: 9:00 AM - 6:00 PM\nFriday: Closed',
  instagramUrl: '',
  facebookUrl: '',
  linkedinUrl: '',
};

const ContactUs = () => {
  const c = useCMS('contact_page', DEFAULTS);
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [message,   setMessage]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await contactAPI.submit({ name: `${firstName} ${lastName}`.trim(), email, message });
      setSuccess(true);
      setFirstName(''); setLastName(''); setEmail(''); setMessage('');
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const socials = [
    {
      label: 'Instagram',
      url: c.instagramUrl,
      color: '#E1306C',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      label: 'Facebook',
      url: c.facebookUrl,
      color: '#1877F2',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      url: c.linkedinUrl,
      color: '#0A66C2',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <h1 className="libre">{c.heroTitle}</h1>
        <p className="encode">{c.heroSubtitle}</p>
      </section>

      <div className="contact-grid">
        <div className="contact-form-side">
          <h2 className="libre">{c.formTitle}</h2>
          {success ? (
            <div style={{ padding: '30px', background: '#e8f5e9', borderRadius: '12px', textAlign: 'center' }}>
              <p className="encode" style={{ color: '#2e7d32', fontWeight: '700', fontSize: '1.1rem' }}>✓ Your message has been sent successfully!</p>
              <p className="encode" style={{ opacity: 0.7, marginTop: '10px' }}>We'll get back to you shortly.</p>
              <button className="contact-submit encode" style={{ marginTop: '20px' }} onClick={() => setSuccess(false)}>Send Another Message</button>
            </div>
          ) : (
            <form className="main-contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="encode">First Name</label>
                  <input type="text" className="encode" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="encode">Last Name</label>
                  <input type="text" className="encode" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="encode">Email Address</label>
                <input type="email" className="encode" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="encode">Message</label>
                <textarea rows="6" className="encode" placeholder="How can we assist you?" value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
              </div>
              {error && <p style={{ color: '#c0392b', fontWeight: '700', fontSize: '0.9rem' }} className="encode">{error}</p>}
              <button type="submit" className="contact-submit encode" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        <div className="contact-info-side">
          <div className="info-box">
            <h3 className="libre">Our Office</h3>
            <p className="encode" style={{ whiteSpace: 'pre-line' }}>{c.office}</p>
          </div>
          <div className="info-box">
            <h3 className="libre">Contact Details</h3>
            <p className="encode">Support: {c.email}<br />Phone: {c.phone}</p>
          </div>
          <div className="info-box">
            <h3 className="libre">Working Hours</h3>
            <p className="encode" style={{ whiteSpace: 'pre-line' }}>{c.workingHours}</p>
          </div>
          <div className="social-links-row">
            {socials.map(({ label, url, icon, color }) =>
              url ? (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-circle"
                  title={label}
                  style={{ '--social-color': color }}
                >
                  {icon}
                </a>
              ) : (
                <div
                  key={label}
                  className="social-circle"
                  title={label}
                  style={{ '--social-color': color }}
                >
                  {icon}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
