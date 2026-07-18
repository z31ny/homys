import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { paymentAPI } from '../services/api';
import './Payment.css';

const STORAGE_KEY = 'homys_payment_state';

const Payment = () => {
  const navigate = useNavigate();
  const { state: routerState } = useLocation();
  const [searchParams] = useSearchParams();
  const isDeclined = searchParams.get('error') === 'failed';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(isDeclined ? 'Payment was not completed.' : '');

  // Restore state from localStorage when coming back from Paymob redirect
  const [bookingState, setBookingState] = useState(() => {
    if (routerState?.bookingId) return routerState;
    if (isDeclined) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
      } catch { return {}; }
    }
    return {};
  });

  const {
    bookingId,
    title = 'Property',
    checkIn = '',
    checkOut = '',
    nights = 0,
    totalPrice = '0.00',
    depositAmount,
  } = bookingState;

  const depositToShow = depositAmount
    ? parseFloat(depositAmount)
    : parseFloat(totalPrice) * 0.5;

  useEffect(() => {
    // Always clean up once we have fresh router state from Checkout
    if (routerState?.bookingId) {
      localStorage.removeItem(STORAGE_KEY);
    }
    // Clear stale state when there's no valid booking context at all
    if (!routerState?.bookingId && !isDeclined) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [routerState, isDeclined]);

  if (!bookingId && !isDeclined) {
    return (
      <div className="payment-page" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h2>No booking to pay for</h2>
        <p style={{ opacity: 0.6, margin: '16px 0 32px' }}>Please complete the booking checkout first.</p>
        <button className="final-pay-btn encode" onClick={() => navigate('/stays')}>Browse Stays</button>
      </div>
    );
  }

  if (!bookingId) {
    return (
      <div className="payment-page" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h2>Session expired</h2>
        <p style={{ opacity: 0.6, margin: '16px 0 32px' }}>We couldn't retrieve your booking details. Please start a new booking.</p>
        <button className="final-pay-btn encode" onClick={() => navigate('/stays')}>Browse Stays</button>
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await paymentAPI.initiate(bookingId);
      const redirectUrl = res.data?.checkoutUrl || res.data?.iframeUrl;
      if (redirectUrl) {
        // Persist booking state so Success/Payment pages can recover after redirect
        localStorage.setItem('homys_pending_booking_id', bookingId);
        localStorage.setItem('homys_pending_booking_title', title);
        localStorage.setItem('homys_pending_num_guests', bookingState.numGuests || 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          bookingId,
          title,
          checkIn,
          checkOut,
          nights,
          totalPrice,
          depositAmount: depositToShow,
          numGuests: bookingState.numGuests || 1,
        }));
        window.location.href = redirectUrl;
      } else {
        setError('Unable to initialize payment. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      {/* navigate to /stays rather than -1 to prevent back-navigating to
          Checkout and accidentally creating a duplicate booking */}
      <button className="back-btn-global" onClick={() => navigate('/stays')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Stays
      </button>

      <div className="payment-content-wrapper">
        <h1 className="libre">Complete Deposit Payment</h1>

        {/* Booking Summary */}
        <div style={{ marginBottom: 20, padding: '20px 24px', background: '#f0ece4', borderRadius: 12 }}>
          <p className="encode" style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>
            <strong>{title}</strong> · {checkIn} — {checkOut} · {nights} night{nights !== 1 ? 's' : ''}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10 }}>
            <span className="encode" style={{ fontSize: '0.85rem', opacity: 0.7 }}>Total price:</span>
            <span className="encode" style={{ fontWeight: 700, color: '#8b8b8b', textDecoration: 'line-through' }}>EGP {parseFloat(totalPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
            <span className="encode" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#112a3d' }}>50% deposit due now:</span>
            <span className="encode" style={{ fontWeight: 900, fontSize: '1.3rem', color: '#112a3d' }}>EGP {depositToShow.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Deposit info */}
        <div style={{ marginBottom: 20, padding: '14px 18px', background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10, fontSize: '0.83rem', color: '#f57f17', lineHeight: 1.6 }}>
          <strong>How it works:</strong> You pay a 50% deposit now to reserve the property. After payment, you'll upload your identity documents for verification. Once approved, your booking is confirmed and the remaining balance is due at check-in.
        </div>

        {/* Secure payment info */}
        <div style={{ marginBottom: 20, padding: '14px 18px', background: '#eaf4ea', borderRadius: 10, fontSize: '0.83rem', color: '#2e7d32', lineHeight: 1.6 }}>
          <strong>Secure Payment</strong> — You'll be redirected to Paymob's secure payment page. We never see or store your card details.
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: '16px 18px', background: '#fde8e8', borderRadius: 10, border: '1px solid #f5c6c6' }}>
            <p className="encode" style={{ color: '#c62828', fontSize: '0.88rem', fontWeight: 700, margin: '0 0 6px' }}>
              {error}
            </p>
            <p className="encode" style={{ color: '#7b1f1f', fontSize: '0.83rem', fontWeight: 500, margin: '0 0 12px', lineHeight: 1.5 }}>
              Don't worry — your booking has been saved. You have <strong>10 minutes</strong> from when it was created to complete the deposit, after which it will be automatically cancelled. Head to your profile to retry.
            </p>
            <button
              type="button"
              className="encode"
              onClick={() => navigate('/profile')}
              style={{ background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 50, padding: '8px 20px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Go to My Profile →
            </button>
          </div>
        )}

        <button
          type="button"
          className="final-pay-btn encode"
          onClick={handlePayment}
          disabled={loading}
          style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Processing…' : `Pay 50% Deposit — EGP ${depositToShow.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        </button>

        <p className="encode" style={{ textAlign: 'center', fontSize: '0.78rem', opacity: 0.45, marginTop: 14 }}>
          Powered by Paymob · PCI DSS Compliant
        </p>
      </div>
    </div>
  );
};

export default Payment;
