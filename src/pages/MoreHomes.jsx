import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MoreHomes.css';

import frame125 from '../imgs/Frame 125.png';
import frame125_1 from '../imgs/Frame 125-1.png';
import frame130 from '../imgs/Frame 130.png';
import rect6 from '../imgs/Rectangle 6.png';
import rect9 from '../imgs/Rectangle 9.png';
import rect10 from '../imgs/Rectangle 10.png';
import rect11 from '../imgs/Rectangle 11.png';

const PropertyCard = ({ home }) => {
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);

  const next = (e) => { e.stopPropagation(); setImgIdx(prev => prev === home.images.length - 1 ? 0 : prev + 1); };
  const prev = (e) => { e.stopPropagation(); setImgIdx(prev => prev === 0 ? home.images.length - 1 : prev - 1); };

  return (
    <div className="m-home-card" onClick={() => navigate('/propertydetails')}>
      <div className="m-img-container">
        <div className="m-carousel" style={{ transform: `translateX(-${imgIdx * 100}%)` }}>
          {home.images.map((img, i) => <img key={i} src={img} alt="Property" />)}
        </div>
        <button className="m-arrow m-left" onClick={prev}>‹</button>
        <button className="m-arrow m-right" onClick={next}>›</button>
        <div className="m-dots">
          {home.images.map((_, i) => <span key={i} className={imgIdx === i ? 'active' : ''} />)}
        </div>
      </div>
      <div className="m-info">
        <h3 className="libre">{home.title}</h3>
        <p className="encode loc">📍 {home.location}</p>
        <div className="m-specs encode">
          <span>{home.beds} Beds</span>
          <span>{home.sqft}</span>
        </div>
        <div className="m-footer">
          <span className="m-price">{home.price}</span>
          <button className="m-view-btn encode">Check Out</button>
        </div>
      </div>
    </div>
  );
};

const MoreHomes = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const homesPerPage = 6;

  const allData = [
    { id: 1, images: [frame125, rect6, rect9], title: 'Azure Sea Suite', location: 'Sahel', beds: 3, sqft: '1400 sqft', price: '$300/night' },
    { id: 2, images: [frame130, rect10, rect11], title: 'Urban Loft', location: 'Cairo', beds: 2, sqft: '1100 sqft', price: '$180/night' },
    { id: 3, images: [frame125_1, rect6, rect11], title: 'Lagoon Villa', location: 'Gouna', beds: 4, sqft: '2200 sqft', price: '$550/night' },
    { id: 4, images: [rect9, frame125, rect10], title: 'Skyline Apartment', location: 'Cairo', beds: 1, sqft: '900 sqft', price: '$140/night' },
    { id: 5, images: [rect11, frame130, rect6], title: 'Sunset Chalet', location: 'North Coast', beds: 3, sqft: '1300 sqft', price: '$320/night' },
    { id: 6, images: [rect10, frame125_1, rect9], title: 'The Penthouse', location: 'Gouna', beds: 5, sqft: '3500 sqft', price: '$900/night' },
    { id: 7, images: [frame125, rect11, rect10], title: 'Coral Bay House', location: 'Red Sea', beds: 3, sqft: '1600 sqft', price: '$400/night' },
    { id: 8, images: [rect6, frame130, rect9], title: 'Modern Hideaway', location: 'Sahel', beds: 2, sqft: '1000 sqft', price: '$220/night' },
  ];

  const indexOfLast = currentPage * homesPerPage;
  const indexOfFirst = indexOfLast - homesPerPage;
  const currentHomes = allData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(allData.length / homesPerPage);

  return (
    <div className="more-homes-page">
      <button className="back-btn-global" onClick={() => navigate('/stays')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Stays
      </button>

      <header className="mh-header">
        <h1 className="libre">More Sanctuaries</h1>
        <p className="encode">Showing {allData.length} premium properties available for your stay.</p>
      </header>

      <div className="mh-grid">
        {currentHomes.map(home => <PropertyCard key={home.id} home={home} />)}
      </div>

      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
        {[...Array(totalPages)].map((_, i) => (
          <button key={i} className={currentPage === i + 1 ? 'active' : ''} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
        ))}
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
      </div>
    </div>
  );
};

export default MoreHomes;