import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Nav from './common/Nav';
import Footer from './common/Footer';
import Whatsapp from './common/Whatsapp';
import Preloader from './common/Preloader';
import ChatBot from './common/ChatBot';
import ScrollToTop from './common/ScrollToTop';
import ErrorBoundary from './common/ErrorBoundary';

const Home             = lazy(() => import('./pages/Home'));
const Stays            = lazy(() => import('./pages/Stays'));
const PropertyDetails  = lazy(() => import('./pages/PropertyDetails'));
const AboutUs          = lazy(() => import('./components/AboutUs'));
const Profile          = lazy(() => import('./pages/Profile'));
const ContactUs        = lazy(() => import('./pages/ContactUs'));
const Checkout         = lazy(() => import('./pages/Checkout'));
const Payment          = lazy(() => import('./pages/Payment'));
const BookingDocs      = lazy(() => import('./pages/BookingDocs'));
const Success          = lazy(() => import('./pages/Success'));
const Cart             = lazy(() => import('./pages/Cart'));
const FAQPage          = lazy(() => import('./pages/FAQPage'));
const AllStays         = lazy(() => import('./pages/AllStays'));
const ListProperty     = lazy(() => import('./pages/ListProperty'));
const Questionnaire    = lazy(() => import('./pages/Questionnaire'));
const BookNow          = lazy(() => import('./pages/BookNow'));
const MoreHomes        = lazy(() => import('./pages/MoreHomes'));
const Login            = lazy(() => import('./pages/Login'));
const Signup           = lazy(() => import('./pages/SignUp'));
const ForgetPassword   = lazy(() => import('./pages/ForgetPassword'));
const ResetPassword    = lazy(() => import('./pages/ResetPassword'));
const Furnish          = lazy(() => import('./pages/Furnish'));
const Error            = lazy(() => import('./pages/Error'));

const AdminLayout         = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview       = lazy(() => import('./pages/admin/Overview'));
const AdminBookings       = lazy(() => import('./pages/admin/Bookings'));
const AdminProperties     = lazy(() => import('./pages/admin/Properties'));
const AdminReviews        = lazy(() => import('./pages/admin/Reviews'));
const AdminDiscounts      = lazy(() => import('./pages/admin/Discounts'));
const AdminGuests         = lazy(() => import('./pages/admin/Guests'));
const AdminMessages       = lazy(() => import('./pages/admin/Messages'));
const AdminAnalytics      = lazy(() => import('./pages/admin/Analytics'));
const AdminWebsiteContent = lazy(() => import('./pages/admin/WebsiteContent'));
const AdminNotifications  = lazy(() => import('./pages/admin/Notifications'));
const AdminSettings       = lazy(() => import('./pages/admin/Settings'));
const AdminAccount        = lazy(() => import('./pages/admin/Account'));
const AdminViewProperty   = lazy(() => import('./pages/admin/ViewProperty'));
const AdminEditProperty   = lazy(() => import('./pages/admin/EditProperty'));
const AdminError          = lazy(() => import('./pages/admin/AdminError'));

/* ── Spinner shown while lazy chunks are downloading ── */
const PageLoader = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{
      width: 36, height: 36,
      border: '3px solid #e8e0d4',
      borderTopColor: '#112a3d',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

/* ── Synchronous admin route guard ── */
const AdminGuard = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated || !user?.isAdmin) return <Navigate to="/" replace />;
  return children;
};

/* ── Synchronous auth guard for user-only pages ── */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

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
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"                element={<Home />} />
            <Route path="/stays"           element={<Stays />} />
            <Route path="/stays/:id"       element={<PropertyDetails />} />
            <Route path="/propertydetails" element={<PropertyDetails />} />
            <Route path="/aboutus"         element={<AboutUs />} />
            <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/login"           element={<Login />} />
            <Route path="/signup"          element={<Signup />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/reset-password"  element={<ResetPassword />} />
            <Route path="/contactus"       element={<ContactUs />} />
            <Route path="/checkout"        element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/payment"         element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/booking-docs"    element={<BookingDocs />} />
            <Route path="/cart"            element={<Cart />} />
            <Route path="/success"         element={<Success />} />
            <Route path="/faq-page"        element={<FAQPage />} />
            <Route path="/all-stays"       element={<AllStays />} />
            <Route path="/list-property"   element={<ProtectedRoute><ListProperty /></ProtectedRoute>} />
            <Route path="/questionnaire"   element={<Questionnaire />} />
            <Route path="/booknow"         element={<BookNow />} />
            <Route path="/morehomes"       element={<MoreHomes />} />
            <Route path="/furnish"         element={<Furnish />} />

            {/* Admin — synchronously guarded before any child renders */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index                  element={<AdminOverview />} />
              <Route path="bookings"        element={<AdminBookings />} />
              <Route path="properties"      element={<AdminProperties />} />
              <Route path="reviews"         element={<AdminReviews />} />
              <Route path="discounts"       element={<AdminDiscounts />} />
              <Route path="guests"          element={<AdminGuests />} />
              <Route path="messages"        element={<AdminMessages />} />
              <Route path="analytics"       element={<AdminAnalytics />} />
              <Route path="website-content" element={<AdminWebsiteContent />} />
              <Route path="notifications"   element={<AdminNotifications />} />
              <Route path="settings"        element={<AdminSettings />} />
              <Route path="account"         element={<AdminAccount />} />
              <Route path="view-property"   element={<AdminViewProperty />} />
              <Route path="edit-property"   element={<AdminEditProperty />} />
              <Route path="*"               element={<AdminError />} />
            </Route>

            <Route path="*" element={<Error />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      {!isAdmin && <Footer />}
    </>
  );
};

const Routing = () => (
  <Router>
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  </Router>
);

export default Routing;
