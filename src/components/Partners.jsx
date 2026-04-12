import React from 'react';
import './Partners.css';
const group14 = 'https://res.cloudinary.com/dzpswgjsm/image/upload/f_auto,q_auto,w_800/homys-static/Group_14.png';
import rect9 from '../imgs/Rectangle 9.png';
import rect10 from '../imgs/Rectangle 10.png';
import rect11 from '../imgs/Rectangle 11.png';
import rect6 from '../imgs/Rectangle 6.png';

const Partners = () => {
  return (
    <section className="partners-section">
      <div className="partners-header">
        <h2 className="partners-title">Explore Our Upcoming <br /> Partners & Stays</h2>
        <div className="partners-arrow">
          <svg width="60" height="20" viewBox="0 0 63 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 7.5H61M61 7.5L54 0.5M61 7.5L54 14.5" stroke="#112a3d" strokeWidth="1"/>
          </svg>
        </div>
      </div>

      <div className="partners-grid-container">
        <div className="featured-partner">
          <div className="partner-img-wrapper">
            <img src={group14} alt="Featured" />
            <div className="partner-overlay">
              <div className="overlay-circle">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                </svg>
              </div>
              <h3>Forums</h3>
              <p>Lorem ipsum dolor sit amet, <br /> consectetuer adipiscing</p>
            </div>
          </div>
        </div>

        <div className="partners-thumbnails">
          <div className="thumb-wrapper">
            <img src={rect9} alt="Stay 1" />
          </div>
          <div className="thumb-wrapper">
            <img src={rect10} alt="Stay 2" />
          </div>
          <div className="thumb-wrapper">
            <img src={rect11} alt="Stay 3" />
          </div>
          <div className="thumb-wrapper">
            <img src={rect6} alt="Stay 4" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;