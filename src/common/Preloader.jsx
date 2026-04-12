import React, { useEffect, useState } from 'react';
import './Preloader.css';

const Preloader = () => {
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Wait for actual page readiness, not a fixed timer
    const onReady = () => {
      // Small delay after load to let paint settle
      setTimeout(() => setIsDone(true), 300);
    };

    if (document.readyState === 'complete') {
      onReady();
    } else {
      window.addEventListener('load', onReady);
      // Safety fallback — never show preloader for more than 4 seconds
      const fallback = setTimeout(() => setIsDone(true), 4000);
      return () => {
        window.removeEventListener('load', onReady);
        clearTimeout(fallback);
      };
    }
  }, []);

  return (
    <div className={`fast-preloader ${isDone ? 'exit' : ''}`}>
      <div className="split-left"></div>
      <div className="split-right"></div>
      
      <div className="kinetic-container">
        <div className="lock-snap">
          <div className="shackle"></div>
          <div className="body">
            <div className="key-flash"></div>
          </div>
        </div>
        <h2 className="libre status-text">HOMYS</h2>
      </div>
    </div>
  );
};

export default Preloader;