import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Stays from './pages/Stays'; 
import Nav from './common/Nav';
import Footer from './common/Footer';
import Whatsapp from './common/Whatsapp';
import Error from './pages/Error';
import PropertyDetails from './pages/PropertyDetails';
import AboutUs from './components/AboutUs';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgetPassword from './pages/ForgetPassword';

const Routing = () => {
  return (
    <Router>
      <Nav />
      <Whatsapp />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Stays" element={<Stays />} />
        <Route path="/PropertyDetails" element={<PropertyDetails />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />

        <Route path="*" element={<Error />} /> 
      </Routes>

      <Footer />
    </Router>
  );
};

export default Routing;