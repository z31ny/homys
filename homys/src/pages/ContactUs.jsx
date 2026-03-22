import React from 'react';
import './ContactUs.css';

const ContactUs = () => {
  return (
    <div className="contact-page">
      <section className="contact-hero">
        <h1 className="libre">Let's Connect</h1>
        <p className="encode">Whether you have a question about our properties or need assistance, we're here to help.</p>
      </section>

      <div className="contact-grid">
        <div className="contact-form-side">
          <h2 className="libre">Send us a Message</h2>
          <form className="main-contact-form">
            <div className="form-row">
              <div className="form-group">
                <label className="encode">First Name</label>
                <input type="text" className="encode" />
              </div>
              <div className="form-group">
                <label className="encode">Last Name</label>
                <input type="text" className="encode" />
              </div>
            </div>
            <div className="form-group">
              <label className="encode">Email Address</label>
              <input type="email" className="encode" />
            </div>
            <div className="form-group">
              <label className="encode">Message</label>
              <textarea rows="6" className="encode" placeholder="How can we assist you?"></textarea>
            </div>
            <button type="submit" className="contact-submit encode">Send Message</button>
          </form>
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