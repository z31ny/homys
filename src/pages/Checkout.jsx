import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';
import './Checkout.css';

import fallbackImg from '../imgs/Frame 125.png';

const Checkout = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();

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
    addons = [],
    addonTotal = 0,
    finalTotal = 0,
  } = state || {};

  // Split user's full name into first/last
  const nameParts = (user?.fullName || '').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 8% service fee
  const serviceFee = parseFloat((finalTotal * 0.08).toFixed(2));
  const grandTotal = (finalTotal + serviceFee).toFixed(2);

  const handleProceed = async () => {
    if (!firstName || !lastName || !email) {
      setError('Please fill in First Name, Last Name, and Email.');
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
        addons,
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
  if (!state?.propertyId) {
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
              placeholder="Phone Number (optional)"
              className="encode"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

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
                <span>${basePrice.toFixed(2)}</span>
              </div>
              {addonTotal > 0 && (
                <div className="price-line">
                  <span>Add-ons</span>
                  <span>${addonTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="price-line">
                <span>Service Fee (8%)</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <div className="total-line libre">
                <span>Total</span>
                <span>${grandTotal}</span>
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