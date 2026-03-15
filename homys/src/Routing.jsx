import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Stays from './pages/Stays'; 
import Nav from './common/Nav';
import Footer from './common/Footer';
import Whatsapp from './common/Whatsapp';
import Error from './pages/Error';

const Routing = () => {
  return (
    <Router>
      <Nav />
      <Whatsapp />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stays" element={<Stays />} />
        <Route path="*" element={<Error />} /> 
      </Routes>

      <Footer />
    </Router>
  );
};

export default Routing;