import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Success.css';

const Success = () => {
  const navigate = useNavigate();
  const [pendingBookingId, setPendingBookingId] = useState(null);
  const [pendingTitle, setPendingTitle]         = useState('');

  const [pendingNumGuests, setPendingNumGuests] = useState(1);

  useEffect(() => {
    const bookingId = localStorage.getItem('homys_pending_booking_id');
    const title     = localStorage.getItem('homys_pending_booking_title');
    const numGuests = parseInt(localStorage.getItem('homys_pending_num_guests') || '1', 10);
    if (bookingId) {
      setPendingBookingId(bookingId);
      setPendingTitle(title || 'your booking');
      setPendingNumGuests(numGuests || 1);
      // Clear so they don't persist across sessions
      localStorage.removeItem('homys_pending_booking_id');
      localStorage.removeItem('homys_pending_booking_title');
      localStorage.removeItem('homys_pending_num_guests');
    }
  }, []);

  const goToDocs = () => {
    navigate('/booking-docs', { state: { bookingId: pendingBookingId, title: pendingTitle, numGuests: pendingNumGuests } });
  };

  return (
    <div className="success-page">
      <div className="success-content">
        <div className="check-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h1 className="libre">Payment Successful</h1>
        <p className="encode">Your deposit has been received. A confirmation email has been sent to your inbox.</p>

        {pendingBookingId && (
          <div style={{ margin: '28px 0', padding: '24px', background: '#fff8e1', border: '1.5px solid #ffe082', borderRadius: 14, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 40, height: 40, background: '#f57f17', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div>
                <p className="libre" style={{ color: '#112a3d', fontWeight: 800, margin: '0 0 6px', fontSize: '1rem' }}>
                  One more step — upload your ID documents
                </p>
                <p className="encode" style={{ color: '#5d4037', fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 16px' }}>
                  Per Egyptian regulations, all guests must verify their identity before check-in. Your booking for <strong>{pendingTitle}</strong> won't be confirmed until documents are reviewed.
                </p>
                <button className="cta-dark encode" onClick={goToDocs}
                  style={{ padding: '10px 24px', borderRadius: 50, border: 'none', background: '#112a3d', color: '#f6f3eb', fontWeight: 800, cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'inherit' }}>
                  Upload Documents Now
                </button>
                <p className="encode" style={{ fontSize: '0.75rem', color: '#8b8b8b', marginTop: 10 }}>
                  You can also do this later from <strong>My Bookings</strong> in your profile.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="success-actions">
          <button className="cta-dark encode" onClick={() => navigate('/profile')}>My Bookings</button>
          <button className="cta-light encode" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    </div>
  );
};

export default Success;
