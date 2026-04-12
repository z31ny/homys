import React from 'react';
import { useNavigate } from 'react-router-dom';
import './QandA.css';
import rect11 from '../imgs/Rectangle 11.png';

const QandA = () => {
  const navigate = useNavigate();

  return (
    <section className="q-and-a-section">
      <div className="q-and-a-container" onClick={() => navigate('/questionnaire')}>
        <div className="q-content-side">
          <div className="q-tag encode">PERSONALIZED GUIDANCE</div>
          <h2 className="libre">Not sure where to start?</h2>
          <p className="roboto">
            Answer 5 simple questions about your dream stay, and our AI will 
            instantly find the perfect sanctuaries tailored to your lifestyle.
          </p>
          <button className="q-start-btn encode">
            Take the Quiz
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        
        <div className="q-visual-side">
            <img src={rect11} alt="Luxury Stay" className="q-visual-img" loading="lazy" />
            <div className="q-icon-overlay">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
            </div>
        </div>
      </div>
    </section>
  );
};

export default QandA;