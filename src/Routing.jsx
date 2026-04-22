import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Eagerly loaded (needed on every page)
import Nav from './common/Nav';
import Footer from './common/Footer';
import Whatsapp from './common/Whatsapp';
import Preloader from './common/Preloader';
import ChatBot from './common/ChatBot';
import ScrollToTop from './common/ScrollToTop';

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

// Admin Dashboard (lazy-loaded — only admin users will ever download these)
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/Overview'));
const AdminBookings = lazy(() => import('./pages/admin/Bookings'));
const AdminProperties = lazy(() => import('./pages/admin/Properties'));
const AdminGuests = lazy(() => import('./pages/admin/Guests'));
const AdminMessages = lazy(() => import('./pages/admin/Messages'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminAccount = lazy(() => import('./pages/admin/Account'));
const AdminViewProperty = lazy(() => import('./pages/admin/ViewProperty'));
const AdminEditProperty = lazy(() => import('./pages/admin/EditProperty'));
const AdminError = lazy(() => import('./pages/admin/AdminError'));

/**
 * Wrapper that conditionally shows the main site Nav/Footer
 * but hides them on /admin/* routes.
 */
const AppShell = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      <Preloader />
      {!isAdmin && <Nav />}
      {!isAdmin && <ChatBot />}
      {!isAdmin && <Whatsapp />}
      <Suspense fallback={null}>
        <Routes>
          {/* ─── Main Site Routes ─── */}
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

          {/* ─── Admin Dashboard Routes ─── */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="guests" element={<AdminGuests />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="account" element={<AdminAccount />} />
            <Route path="view-property" element={<AdminViewProperty />} />
            <Route path="edit-property" element={<AdminEditProperty />} />
            <Route path="*" element={<AdminError />} />
          </Route>

          <Route path="*" element={<Error />} />
        </Routes>
      </Suspense>
      {!isAdmin && <Footer />}
    </>
  );
};

const Routing = () => {
  return (
    <Router>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </Router>
  );
};

export default Routing;