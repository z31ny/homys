import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Home from './pages/Home';
import Stays from './pages/Stays'; 
import Nav from './common/Nav';
import Footer from './common/Footer';
import Whatsapp from './common/Whatsapp';
import Error from './pages/Error';
import PropertyDetails from './pages/PropertyDetails';
import AboutUs from './components/AboutUs';
import Profile from './pages/Profile';
import ContactUs from './pages/ContactUs';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Success from './pages/Success';
import Cart from './pages/Cart';
import FAQPage from './pages/FAQPage';
import AllStays from './pages/AllStays';
import ListProperty from './pages/ListProperty';
import Questionnaire from './pages/Questionnaire';
import ChatBot from './common/ChatBot';
import BookNow from './pages/BookNow';
import MoreHomes from './pages/MoreHomes';
import Preloader from './common/Preloader';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import ForgetPassword from './pages/ForgetPassword';
import Furnish from './pages/Furnish';

const Routing = () => {
  return (
    <Router>
      <AuthProvider>
       <Preloader/>
       <Nav/>
       <ChatBot/>
       <Whatsapp />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stays" element={<Stays />} />
        <Route path="/stays/:id" element={<PropertyDetails />} />
        <Route path="/propertydetails" element={<PropertyDetails />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/success" element={<Success />} />
        <Route path="/faq-page" element={<FAQPage />} />
        <Route path="/all-stays" element={<AllStays />} />
        <Route path="/list-property" element={<ListProperty />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/booknow" element={<BookNow />} />
        <Route path="/morehomes" element={<MoreHomes />} />
        <Route path="/furnish" element={<Furnish />} />
        <Route path="*" element={<Error />} /> 
      </Routes>
      <Footer />
      </AuthProvider>
    </Router>
  );
};

export default Routing;