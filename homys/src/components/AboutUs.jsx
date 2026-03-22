import React, { useState, useEffect } from 'react';
import './AboutUs.css';

import missionImg from '../imgs/Group 14.png';
import team1 from '../imgs/Rectangle 6.png';
import team2 from '../imgs/Rectangle 9.png';
import team3 from '../imgs/Rectangle 10.png';
import team4 from '../imgs/Rectangle 11.png';
import team5 from '../imgs/Rectangle 6.png';
import team6 from '../imgs/Rectangle 9.png';

const Counter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const endValue = parseInt(end.replace(/,/g, ''));
    if (start === endValue) return;
    let totalMiliseconds = duration;
    let timer = setInterval(() => {
      start += Math.ceil(endValue / 50);
      if (start >= endValue) {
        setCount(endValue);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const AboutUs = () => {
  return (
    <div className="about-us-page">
      <section className="about-hero">
        <div className="about-hero-text">
          <h1 className="libre">We believe <br /> <span className="highlight">home</span> is more <br /> than a place.</h1>
          <p className="encode">Homys was founded on the idea that luxury and comfort should be accessible to everyone who seeks a sanctuary by the sea or in the heart of the city.</p>
        </div>
      </section>

      <section className="about-mission-banner">
        <div className="mission-content">
          <h2 className="libre">Homys was born from a desire to redefine the concept of home.</h2>
        </div>
      </section>

      <section className="about-split">
        <div className="split-img">
          <img src={missionImg} alt="Mission" />
        </div>
        <div className="split-text">
          <h3 className="libre">Finding the soul in modern living.</h3>
          <p className="encode">Every property we manage is hand-picked for its unique character. We don't just provide rooms; we provide the backdrop for your most cherished memories.</p>
        </div>
      </section>

      <section className="about-stats">
        <div className="stat-item">
          <h4 className="libre"><Counter end="12" suffix="+" /></h4>
          <p className="encode">Destinations</p>
        </div>
        <div className="stat-item">
          <h4 className="libre"><Counter end="5000" suffix="+" /></h4>
          <p className="encode">Happy Guests</p>
        </div>
        <div className="stat-item">
          <h4 className="libre"><Counter end="30000" suffix="+" /></h4>
          <p className="encode">Nights Booked</p>
        </div>
        <div className="stat-item">
          <h4 className="libre"><Counter end="88" suffix="%" /></h4>
          <p className="encode">Return Rate</p>
        </div>
      </section>

      <section className="why-choose-section">
        <h2 className="libre section-title">Why Choose Homys?</h2>
        <div className="why-grid">
          <div className="why-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <h5 className="encode">Trusted Security</h5>
            <p className="encode">We prioritize your safety with state-of-the-art security systems and 24/7 on-site presence.</p>
          </div>
          <div className="why-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
            <h5 className="encode">Verified Quality</h5>
            <p className="encode">Every home undergoes a 100-point inspection to meet our elite hospitality standards.</p>
          </div>
          <div className="why-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            <h5 className="encode">Effortless Booking</h5>
            <p className="encode">Simple, transparent, and fast booking process with instant confirmation and flexible dates.</p>
          </div>
          <div className="why-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <h5 className="encode">Prime Locations</h5>
            <p className="encode">Strategically located properties that put you at the heart of the most vibrant communities.</p>
          </div>
        </div>
      </section>

      <section className="founders-section">
        <h2 className="libre section-title">Our Founders</h2>
        <div className="founders-grid">
          <div className="founder-card">
            <div className="founder-img">
              <img src={team5} alt="Mohamed Magdy" />
            </div>
            <div className="founder-info">
              <h4 className="libre">Mohamed Magdy</h4>
              <span className="encode">Co-Founder & CEO</span>
              <p className="encode">A visionary leader with over a decade of experience in real estate and hospitality, Mohamed is dedicated to creating seamless living experiences that feel like home.</p>
            </div>
          </div>
          <div className="founder-card">
            <div className="founder-img">
              <img src={team6} alt="Korashy" />
            </div>
            <div className="founder-info">
              <h4 className="libre">Korashy</h4>
              <span className="encode">Co-Founder & COO</span>
              <p className="encode">With an eye for detail and a passion for operational excellence, Korashy ensures that every Homys property operates with the highest level of care and precision.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-journey">
        <h2 className="libre section-title white-text">The Journey So Far</h2>
        <div className="timeline-v2">
          <div className="center-line"></div>
          <div className="timeline-row left-content">
            <div className="content-side">
              <h4 className="libre">2021</h4>
              <p className="encode">Homys officially launched with 3 coastal properties.</p>
            </div>
            <div className="dot-side"><div className="timeline-dot-v2"></div></div>
            <div className="empty-side"></div>
          </div>
          <div className="timeline-row right-content">
            <div className="empty-side"></div>
            <div className="dot-side"><div className="timeline-dot-v2"></div></div>
            <div className="content-side">
              <h4 className="libre">2022</h4>
              <p className="encode">Expanded to city sanctuaries in the heart of Cairo.</p>
            </div>
          </div>
          <div className="timeline-row left-content">
            <div className="content-side">
              <h4 className="libre">2023</h4>
              <p className="encode">Voted "Best Emerging Hospitality Brand" in the region.</p>
            </div>
            <div className="dot-side"><div className="timeline-dot-v2"></div></div>
            <div className="empty-side"></div>
          </div>
          <div className="timeline-row right-content">
            <div className="empty-side"></div>
            <div className="dot-side"><div className="timeline-dot-v2"></div></div>
            <div className="content-side">
              <h4 className="libre">2024</h4>
              <p className="encode">Reaching our 50th property milestone across Egypt.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-team">
        <h2 className="libre section-title">Know more about our properties</h2>
        <div className="team-grid">
          {[team1, team2, team3, team4, team5, team6].map((member, i) => (
            <div key={i} className="team-card">
              <div className="team-img-wrapper">
                <img src={member} alt="Team" />
              </div>
              <h6 className="encode">Team Member</h6>
              <p className="encode">Executive Leader</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-cta">
        <h2 className="libre">Ready to find your Homys?</h2>
        <p className="encode">Join our community and discover a new way of staying.</p>
        <div className="cta-btns">
          <button className="cta-dark encode">Get Started</button>
          <button className="cta-light encode">Stays</button>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;