import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI, paymentAPI } from '../services/api';
import './Profile.css';

const DEPOSIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const CountdownTimer = ({ deadline, onExpired }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = new Date(deadline).getTime() - Date.now();
    return diff > 0 ? Math.floor(diff / 1000) : 0;
  });

  useEffect(() => {
    if (timeLeft <= 0) { onExpired?.(); return; }
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); onExpired?.(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);  // eslint-disable-line

  if (timeLeft <= 0) return null;
  const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const s = String(timeLeft % 60).padStart(2, '0');
  return (
    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e65100', fontFamily: 'inherit' }}>
      Pay within {m}:{s}
    </span>
  );
};

// Returns the effective deadline for a booking's deposit window.
// Uses paymentDeadline if the column exists, else falls back to createdAt + 10 min.
function getDepositDeadline(stay) {
  if (stay.paymentDeadline) return stay.paymentDeadline;
  if (stay.createdAt) return new Date(new Date(stay.createdAt).getTime() + DEPOSIT_WINDOW_MS).toISOString();
  return null;
}

const Profile = () => {
  const { user, isAuthenticated, loading: authLoading, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [cancelError, setCancelError] = useState('');
  const [payingRemainingId, setPayingRemainingId] = useState(null);
  const [payingDepositId, setPayingDepositId] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Show success message when returning from remaining payment
  useEffect(() => {
    if (searchParams.get('paymentSuccess') === 'remaining') {
      setPaymentSuccessMsg('🎉 Full payment received! Your booking is now confirmed.');
      setActiveTab('bookings');
      setTimeout(() => setPaymentSuccessMsg(''), 8000);
    }
  }, [searchParams]);

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setCountry(user.country || '');
    }
  }, [user]);

  // Fetch bookings when tab switches
  useEffect(() => {
    if (activeTab === 'bookings' && isAuthenticated) {
      setBookingsLoading(true);
      bookingsAPI.list()
        .then((res) => setBookings(res.data.bookings || []))
        .catch(() => setBookings([]))
        .finally(() => setBookingsLoading(false));
    }
  }, [activeTab, isAuthenticated]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await updateProfile({ fullName, phone, country });
      setSaveMsg('Profile updated successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCancelBooking = async () => {
    const bookingId = confirmCancelId;
    if (!bookingId) return;
    setCancellingId(bookingId);
    setCancelError('');
    try {
      await bookingsAPI.cancel(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
      setConfirmCancelId(null);
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const handlePayRemaining = async (bookingId) => {
    setPayingRemainingId(bookingId);
    try {
      const res = await paymentAPI.initiateRemaining(bookingId);
      const redirectUrl = res.data?.checkoutUrl || res.data?.iframeUrl;
      if (redirectUrl) window.location.href = redirectUrl;
    } catch (err) {
      setPaymentError(err.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setPayingRemainingId(null);
    }
  };

  const handlePayDeposit = async (stay) => {
    setPayingDepositId(stay.id);
    try {
      const res = await paymentAPI.initiate(stay.id);
      const redirectUrl = res.data?.checkoutUrl || res.data?.iframeUrl;
      if (redirectUrl) {
        // Persist booking context so the payment page can recover after Paymob redirect
        localStorage.setItem('homys_payment_state', JSON.stringify({
          bookingId: stay.id,
          title: stay.propertyTitle || 'Property',
          checkIn: stay.checkIn,
          checkOut: stay.checkOut,
          nights: stay.nights || 0,
          totalPrice: stay.totalPrice || '0.00',
          numGuests: stay.numGuests || 1,
        }));
        window.location.href = redirectUrl;
      }
    } catch (err) {
      setPaymentError(err.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setPayingDepositId(null);
    }
  };

  if (authLoading) {
    return <div className="profile-page"><p style={{ textAlign: 'center', padding: '100px 20px' }}>Loading...</p></div>;
  }

  if (!user) return null;

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <h1 className="libre">My Sanctuary</h1>
        <p className="encode">Welcome back, {user.fullName?.split(' ')[0]}. Manage your stays and personal details.</p>
      </section>

      {paymentSuccessMsg && (
        <div style={{ margin: '0 auto 0', maxWidth: 900, padding: '0 20px' }}>
          <div style={{ background: '#e8f5e9', border: '1.5px solid #a5d6a7', borderRadius: 12, padding: '14px 20px', color: '#2e7d32', fontWeight: 700, fontFamily: 'Encode Sans Expanded, sans-serif', fontSize: '0.9rem' }}>
            {paymentSuccessMsg}
          </div>
        </div>
      )}

      <div className="profile-container">
        <aside className="profile-sidebar">
          <button 
            className={`sidebar-link encode ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Personal Information
          </button>
          <button 
            className={`sidebar-link encode ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Previous Bookings
          </button>
          <button className="sidebar-link encode logout" onClick={handleLogout}>
            Logout
          </button>
        </aside>

        <main className="profile-content">
          {activeTab === 'info' ? (
            <div className="info-section animate-fade">
              <h2 className="libre">Personal Info</h2>
              <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
                <div className="input-row">
                  <div className="input-group">
                    <label className="encode">Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="encode" />
                  </div>
                  <div className="input-group">
                    <label className="encode">Email Address</label>
                    <input type="email" value={user.email || ''} className="encode" disabled style={{ opacity: 0.6 }} />
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label className="encode">Phone Number</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="encode" placeholder="+20 123 456 789" />
                  </div>
                  <div className="input-group">
                    <label className="encode">Country</label>
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="encode" placeholder="Egypt" />
                  </div>
                </div>
                {saveMsg && (
                  <p style={{ color: saveMsg.includes('success') ? '#2e7d32' : '#c0392b', fontWeight: '700', fontSize: '0.9rem', marginTop: '10px' }} className="encode">
                    {saveMsg}
                  </p>
                )}
                <button type="button" className="save-btn encode" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bookings-section animate-fade">
              <h2 className="libre">My Bookings</h2>
              {paymentError && (
                <div style={{ background: '#fde8e8', border: '1px solid #f5c6c6', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <p className="encode" style={{ color: '#c62828', fontSize: '0.85rem', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>{paymentError}</p>
                  <button onClick={() => setPaymentError('')} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: 0, flexShrink: 0 }}>✕</button>
                </div>
              )}
              {bookingsLoading ? (
                <p className="encode" style={{ opacity: 0.6 }}>Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p className="encode" style={{ opacity: 0.6, marginBottom: '20px' }}>You haven't made any bookings yet.</p>
                  <button className="save-btn encode" onClick={() => navigate('/stays')} style={{ maxWidth: '250px' }}>
                    Explore Stays
                  </button>
                </div>
              ) : (
                <div className="bookings-list">
                  {bookings.map(stay => (
                    <div key={stay.id} className="booking-card">
                      <div className="booking-details" style={{ flex: 1 }}>
                        <h4 className="libre">{stay.propertyTitle || 'Property'}</h4>
                        <p className="encode">{stay.propertyLocation || ''}</p>
                        <p className="encode">{stay.checkIn} — {stay.checkOut}</p>
                        <div className="booking-footer">
                          <span className="price encode">EGP {stay.totalPrice}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className={`status encode ${stay.status}`} style={{ lineHeight: 1 }}>{stay.status}</span>
                            {!stay.depositPaid && !['cancelled', 'completed'].includes(stay.status) && (
                              <>
                                {getDepositDeadline(stay) && (
                                  <CountdownTimer
                                    deadline={getDepositDeadline(stay)}
                                    onExpired={() => setBookings((prev) =>
                                      prev.map((b) => b.id === stay.id ? { ...b, status: 'cancelled' } : b)
                                    )}
                                  />
                                )}
                                <button
                                  className="encode"
                                  style={{ padding: '6px 16px', fontSize: '0.78rem', borderRadius: 50, background: '#c5a367', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', lineHeight: 1, fontFamily: 'inherit' }}
                                  onClick={() => handlePayDeposit(stay)}
                                  disabled={payingDepositId === stay.id}
                                >
                                  {payingDepositId === stay.id ? 'Redirecting…' : 'Pay Deposit'}
                                </button>
                              </>
                            )}
                            {stay.depositPaid && stay.docsStatus === 'pending' && (
                              <button
                                className="encode"
                                style={{ padding: '6px 16px', fontSize: '0.78rem', borderRadius: 50, background: '#f57f17', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', lineHeight: 1, fontFamily: 'inherit' }}
                                onClick={() => navigate('/booking-docs', { state: { bookingId: stay.id, title: stay.propertyTitle || 'your booking', numGuests: stay.numGuests || 1 } })}
                              >
                                Upload Documents
                              </button>
                            )}
                            {stay.docsStatus === 'approved' && !stay.remainingPaid && (
                              <button
                                className="encode"
                                style={{ padding: '6px 16px', fontSize: '0.78rem', borderRadius: 50, background: '#112a3d', color: '#f6f3eb', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', lineHeight: 1, fontFamily: 'inherit' }}
                                onClick={() => handlePayRemaining(stay.id)}
                                disabled={payingRemainingId === stay.id}
                              >
                                {payingRemainingId === stay.id ? 'Redirecting…' : 'Pay Remaining 50%'}
                              </button>
                            )}
                            {stay.docsStatus === 'approved' && stay.remainingPaid && (
                              <span style={{ padding: '6px 12px', borderRadius: 50, background: '#e8f5e9', color: '#2e7d32', fontWeight: 700, fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>
                                ✓ Fully Paid
                              </span>
                            )}
                            {['pending', 'confirmed', 'upcoming'].includes(stay.status) && (
                              <button
                                className="cancel-booking-btn encode"
                                onClick={() => { setConfirmCancelId(stay.id); setCancelError(''); }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Cancel Confirmation Modal */}
      {confirmCancelId && (
        <div className="cancel-modal-overlay" onClick={() => { if (!cancellingId) setConfirmCancelId(null); }}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="libre">Cancel Booking</h3>
            <p className="encode">Are you sure you want to cancel this booking? This action cannot be undone.</p>
            {cancelError && (
              <div className="cancel-modal-error encode">{cancelError}</div>
            )}
            <div className="cancel-modal-actions">
              <button
                className="cancel-modal-btn confirm encode"
                onClick={handleCancelBooking}
                disabled={cancellingId}
              >
                {cancellingId ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
              <button
                className="cancel-modal-btn dismiss encode"
                onClick={() => setConfirmCancelId(null)}
                disabled={cancellingId}
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;