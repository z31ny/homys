import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import './AdminError.css';

const ErrorPage = () => {
  return (
    <div className="error-page-container">
      <div className="error-content">
        <div className="error-icon-wrap">
          <AlertCircle size={80} strokeWidth={1.5} />
        </div>
        <h1 className="error-title">404</h1>
        <h2 className="error-subtitle">Page Not Found</h2>
        <p className="error-text">
          Oops! The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>
        
        <div className="error-actions">
          <Link to="/admin" className="error-btn primary">
            <Home size={18} />
            Back to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="error-btn secondary">
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
      
      <div className="error-bg-decoration">
        <span className="deco-item">404</span>
        <span className="deco-item thin">LOST</span>
      </div>
    </div>
  );
};

export default ErrorPage;
