import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, isAuthenticated, loading: authLoading, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const navigate = useNavigate();

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

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

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
                          <span className="price encode">${stay.totalPrice}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className={`status encode ${stay.status}`}>{stay.status}</span>
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