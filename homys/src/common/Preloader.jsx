import React, { useEffect, useState } from 'react';
import './Preloader.css';

const Preloader = () => {
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDone(true);
    }, 1200); 
    return () => clearTimeout(timer);
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