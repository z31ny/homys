import React, { useState } from 'react';
import { contactAPI } from '../services/api';
import './ContactUs.css';

const ContactUs = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await contactAPI.submit({
        name: `${firstName} ${lastName}`.trim(),
        email,
        message,
      });
      setSuccess(true);
      setFirstName(''); setLastName(''); setEmail(''); setMessage('');
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <h1 className="libre">Let's Connect</h1>
        <p className="encode">Whether you have a question about our properties or need assistance, we're here to help.</p>
      </section>

      <div className="contact-grid">
        <div className="contact-form-side">
          <h2 className="libre">Send us a Message</h2>
          {success ? (
            <div style={{ padding: '30px', background: '#e8f5e9', borderRadius: '12px', textAlign: 'center' }}>
              <p className="encode" style={{ color: '#2e7d32', fontWeight: '700', fontSize: '1.1rem' }}>
                ✓ Your message has been sent successfully!
              </p>
              <p className="encode" style={{ opacity: 0.7, marginTop: '10px' }}>We'll get back to you shortly.</p>
              <button className="contact-submit encode" style={{ marginTop: '20px' }} onClick={() => setSuccess(false)}>
                Send Another Message
              </button>
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
            <p className="encode">123 Coastal Drive, North Coast<br />Alexandria, Egypt</p>
          </div>
          <div className="info-box">
            <h3 className="libre">Contact Details</h3>
            <p className="encode">Support: hello@homys.com<br />Phone: +20 123 456 789</p>
          </div>
          <div className="info-box">
            <h3 className="libre">Working Hours</h3>
            <p className="encode">Sat - Thu: 9:00 AM - 6:00 PM<br />Friday: Closed</p>
          </div>
          <div className="social-links-row">
            <div className="social-circle">IG</div>
            <div className="social-circle">FB</div>
            <div className="social-circle">LI</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;