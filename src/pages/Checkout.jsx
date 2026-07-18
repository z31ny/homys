import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';
import './Checkout.css';

import fallbackImg from '../imgs/Frame 125.png';

const Checkout = () => {
  const navigate = useNavigate();
  const { state: routerState } = useLocation();
  const { user } = useAuth();

  // Restore booking data from sessionStorage if router state is lost (edge case 10.2)
  const bookingData = routerState || (() => {
    try {
      const saved = sessionStorage.getItem('homys_checkout_data');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  })();

  // Persist booking data to sessionStorage on mount
  useEffect(() => {
    if (routerState?.propertyId) {
      sessionStorage.setItem('homys_checkout_data', JSON.stringify(routerState));
    }
  }, [routerState]);

  const {
    propertyId,
    title = 'Property',
    locationName = '',
    heroImageUrl,
    checkIn = '',
    checkOut = '',
    nights = 0,
    numGuests = 1,
    basePrice = 0,
    offersHousekeeping = false,
    offersBeachAccess = false,
    beachAccessPrice = 2000,
    serviceFeePercent = 10,
  } = bookingData;

  // Split user's full name into first/last
  const nameParts = (user?.fullName || '').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ── Mandatory extra fees (display only — the backend computes the charge) ──
  const weeks = Math.max(1, Math.ceil((nights || 0) / 7));
  const oneNight = nights > 0 ? basePrice / nights : 0; // 1 night's price
  const feeLines = [
    { serviceName: 'Insurance', price: oneNight, note: 'refundable on check-out' },
    ...(offersHousekeeping ? [{ serviceName: 'Housekeeping', price: 2000, note: 'per stay' }] : []),
    ...(offersBeachAccess ? [{ serviceName: 'Beach Access', price: beachAccessPrice * weeks * (numGuests || 1), note: `${weeks} week${weeks !== 1 ? 's' : ''} × ${numGuests} guest${numGuests !== 1 ? 's' : ''}` }] : []),
  ];
  const addonTotal = feeLines.reduce((s, a) => s + a.price, 0);

  // Per-property service fee % — charged on the booking base only (excludes fees)
  const serviceFee = parseFloat((basePrice * (serviceFeePercent / 100)).toFixed(2));
  const grandTotal = (basePrice + addonTotal + serviceFee).toFixed(2);

  const handleProceed = async () => {
    if (!firstName || !lastName || !email) {
      setError('Please fill in First Name, Last Name, and Email.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number — it is required to confirm your stay.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await bookingsAPI.create({
        propertyId,
        checkIn,
        checkOut,
        numGuests,
        numRooms: 1,
        guestFirstName: firstName,
        guestLastName: lastName,
        guestEmail: email,
        guestPhone: phone || undefined,
        specialRequests: specialRequests || undefined,
      });

      const booking = res.data.booking;
      navigate('/payment', {
        state: {
          bookingId: booking.id,
          title,
          locationName,
          heroImageUrl,
          checkIn,
          checkOut,
          nights,
          numGuests,
          totalPrice: booking.totalPrice,
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Guard: redirect if no booking context
  if (!propertyId) {
    return (
      <div className="checkout-page" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h2>No booking in progress</h2>
        <p style={{ opacity: 0.6, margin: '16px 0 32px' }}>
          Please select a property and choose your dates first.
        </p>
        <button className="proceed-btn encode" onClick={() => navigate('/stays')}>Browse Stays</button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <button className="back-btn-global" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>

      <div className="checkout-container">
        <div className="checkout-left">
          <h1 className="libre">Confirm Your Stay</h1>
          <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
            <h3 className="encode section-label">Guest Information</h3>
            <div className="input-grid">
              <input
                type="text"
                placeholder="First Name"
                className="encode"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="encode"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              className="encode"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              className="encode"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <h3 className="encode section-label" style={{ marginTop: '40px' }}>Fees Included</h3>
            {feeLines.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0ece4' }}>
                <span style={{ flex: 1 }}>
                  <strong style={{ color: '#112a3d' }}>{f.serviceName}</strong>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#8b8b8b' }}>{f.note}</span>
                </span>
                <strong style={{ color: '#112a3d' }}>EGP {Math.round(f.price).toLocaleString()}</strong>
              </div>
            ))}
            <p style={{ fontSize: '0.78rem', color: '#8b8b8b', marginTop: 8 }} className="encode">
              These fees are part of your stay. The <strong>insurance fee equals one night and is fully refunded to you at check-out.</strong>
            </p>

            <h3 className="encode section-label" style={{ marginTop: '40px' }}>Special Requests</h3>
            <textarea
              className="encode"
              placeholder="Anything we should know?"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            />

            {error && (
              <p style={{ color: '#c0392b', fontWeight: 700, fontSize: '0.9rem', marginTop: 12 }} className="encode">
                {error}
              </p>
            )}
          </form>
        </div>

        <aside className="checkout-right">
          <div className="summary-card">
            <div className="summary-img">
              <img
                src={heroImageUrl || fallbackImg}
                alt={title}
                onError={(e) => { e.target.src = fallbackImg; }}
              />
            </div>
            <div className="summary-details">
              <h4 className="libre">{title}</h4>
              <p className="encode">{checkIn} — {checkOut}</p>
              <div className="price-line">
                <span>Base ({nights} night{nights !== 1 ? 's' : ''})</span>
                <span>EGP {basePrice.toFixed(2)}</span>
              </div>
              {feeLines.map((a, i) => (
                <div className="price-line" key={i}>
                  <span>{a.serviceName}</span>
                  <span>EGP {Math.round(a.price).toLocaleString()}</span>
                </div>
              ))}
              <div className="price-line">
                <span>Service Fee ({serviceFeePercent}%)</span>
                <span>EGP {serviceFee.toFixed(2)}</span>
              </div>
              <div className="total-line libre">
                <span>Total</span>
                <span>EGP {grandTotal}</span>
              </div>
              <button
                className="proceed-btn encode"
                onClick={handleProceed}
                disabled={submitting}
              >
                {submitting ? 'Creating Booking…' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;