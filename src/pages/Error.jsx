import React from 'react';
import { Link } from 'react-router-dom';
import './Error.css';

const Error = () => {
  return (
    <section className="error-page">
      <h1 className="error-bg-code">404</h1>
      
      <div className="error-content">
        <div className="error-icon">
          <svg width="45" height="45" viewBox="0 0 24 24" fill="#112a3d">
            <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
          </svg>
        </div>

        <h2 className="error-title">Page Not Found</h2>
        
        <p className="error-text">
          The sanctuary you are looking for doesn't exist or has been moved. 
          Let's get you back to comfort.
        </p>

        <Link to="/" className="error-btn">
          Back to Home
        </Link>
      </div>
    </section>
  );
};

export default Error;