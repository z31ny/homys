import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Eagerly loaded (needed on every page)
import Nav from './common/Nav';
import Footer from './common/Footer';
import Whatsapp from './common/Whatsapp';
import Preloader from './common/Preloader';
import ChatBot from './common/ChatBot';

// Lazy-loaded pages — only downloaded when the user navigates to them
const Home = lazy(() => import('./pages/Home'));
const Stays = lazy(() => import('./pages/Stays'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const AboutUs = lazy(() => import('./components/AboutUs'));
const Profile = lazy(() => import('./pages/Profile'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Payment = lazy(() => import('./pages/Payment'));
const Success = lazy(() => import('./pages/Success'));
const Cart = lazy(() => import('./pages/Cart'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const AllStays = lazy(() => import('./pages/AllStays'));
const ListProperty = lazy(() => import('./pages/ListProperty'));
const Questionnaire = lazy(() => import('./pages/Questionnaire'));
const BookNow = lazy(() => import('./pages/BookNow'));
const MoreHomes = lazy(() => import('./pages/MoreHomes'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/SignUp'));
const ForgetPassword = lazy(() => import('./pages/ForgetPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Furnish = lazy(() => import('./pages/Furnish'));
const Error = lazy(() => import('./pages/Error'));

const Routing = () => {
  return (
    <Router>
      <AuthProvider>
       <Preloader/>
       <Nav/>
       <ChatBot/>
       <Whatsapp />
       <Suspense fallback={null}>
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
          <Route path="/reset-password" element={<ResetPassword />} />
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
       </Suspense>
      <Footer />
      </AuthProvider>
    </Router>
  );
};

export default Routing;