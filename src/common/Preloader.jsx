import React, { useEffect, useState } from 'react';
import './Preloader.css';
import logo from '../imgs/loggo.png';

const Preloader = () => {
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const onReady = () => {
      setTimeout(() => setIsDone(true), 300);
    };

    if (document.readyState === 'complete') {
      onReady();
    } else {
      window.addEventListener('load', onReady);
      const fallback = setTimeout(() => setIsDone(true), 5500);
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
        <img src={logo} alt="Homys" className="preloader-logo" />
      </div>
    </div>
  );
};

export default Preloader;