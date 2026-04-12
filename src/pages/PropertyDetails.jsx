import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertiesAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './PropertyDetails.css';

const fallbackImg = 'https://res.cloudinary.com/dzpswgjsm/image/upload/f_auto,q_auto,w_800/homys-static/StaysHero.png';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Booking sidebar state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numGuests, setNumGuests] = useState(1);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [hoverStar, setHoverStar] = useState(0);

  useEffect(() => {
    if (!id) {
      setError('No property selected.');
      setLoading(false);
      return;
    }
    propertiesAPI.getById(id)
      .then((res) => setProperty(res.data.property))
      .catch((err) => setError(err.message || 'Property not found.'))
      .finally(() => setLoading(false));

    // Fetch reviews
    reviewsAPI.getByProperty(id)
      .then((res) => {
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.averageRating || 0);
        setTotalReviews(res.data.totalReviews || 0);
      })
      .catch(() => {});
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setReviewError('Please log in to submit a review.');
      return;
    }
    setReviewError('');
    setReviewSubmitting(true);
    try {
      await reviewsAPI.create({
        propertyId: id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSuccess(true);
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="property-details-page" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <p style={{ opacity: 0.5, fontSize: '1.1rem' }}>Loading property…</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="property-details-page" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 16 }}>Property Not Found</h2>
        <p style={{ opacity: 0.6, marginBottom: 32 }}>{error || 'This property does not exist or is unavailable.'}</p>
        <button className="pd-primary-btn" onClick={() => navigate('/stays')}>Back to Stays</button>
      </div>
    );
  }

  // Build image arrays from real data
  const heroImages = property.images?.length > 0
    ? property.images.map(img => img.imageUrl)
    : [fallbackImg];
  const galleryImages = heroImages;

  const nextHero = () => setCurrentHeroIndex((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
  const prevHero = () => setCurrentHeroIndex((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1));

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextLightbox = (e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1)); };
  const prevLightbox = (e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1)); };

  // Calculate nights and total for the sidebar
  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
    : 0;
  const basePrice = nights * parseFloat(property.pricePerNight || 0);

  const handleBookNow = () => {
    if (!checkIn || !checkOut || nights <= 0) {
      alert('Please select valid check-in and check-out dates.');
      return;
    }

    // Redirect to login if not authenticated (edge case 10.1)
    if (!isAuthenticated) {
      // Store intended booking in sessionStorage so we can restore after login
      sessionStorage.setItem('homys_pending_booking', JSON.stringify({
        propertyId: property.id,
        checkIn,
        checkOut,
        numGuests,
      }));
      navigate('/login', { state: { returnTo: `/stays/${property.id}` } });
      return;
    }

    navigate('/cart', {
      state: {
        propertyId: property.id,
        title: property.title,
        locationName: property.locationName,
        heroImageUrl: heroImages[0],
        pricePerNight: parseFloat(property.pricePerNight),
        checkIn,
        checkOut,
        nights,
        numGuests,
        basePrice,
      },
    });
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width={interactive ? "28" : "16"}
            height={interactive ? "28" : "16"}
            viewBox="0 0 24 24"
            fill={star <= (interactive ? (hoverStar || reviewRating) : rating) ? '#d1a67a' : 'none'}
            stroke={star <= (interactive ? (hoverStar || reviewRating) : rating) ? '#d1a67a' : '#ccc'}
            strokeWidth="1.5"
            style={interactive ? { cursor: 'pointer', transition: 'transform 0.15s' } : {}}
            onClick={interactive ? () => setReviewRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverStar(star) : undefined}
            onMouseLeave={interactive ? () => setHoverStar(0) : undefined}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="property-details-page">
      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lb-close" onClick={closeLightbox}>✕</button>
          <button className="lb-nav lb-prev" onClick={prevLightbox}>‹</button>
          <div className="lb-content">
            <img src={galleryImages[lightboxIndex]} alt="Zoomed view" className="lb-img"
              onError={(e) => { e.target.src = fallbackImg; }} />
          </div>
          <button className="lb-nav lb-next" onClick={nextLightbox}>›</button>
          <div className="lb-counter">{lightboxIndex + 1} / {galleryImages.length}</div>
        </div>
      )}

      <section className="pd-hero">
        <div className="pd-hero-slider">
          <img
            src={heroImages[currentHeroIndex]}
            alt="Hero"
            className="pd-hero-img"
            onError={(e) => { e.target.src = fallbackImg; }}
          />
          {heroImages.length > 1 && (
            <>
              <button className="pd-nav-btn prev" onClick={prevHero}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button className="pd-nav-btn next" onClick={nextHero}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </>
          )}
        </div>
      </section>

      <section className="pd-main-container">
        <div className="pd-left-content">
          <div className="pd-header">
            <h1 className="pd-title">{property.title}</h1>
            <p className="pd-location">
              {property.locationName}
              {property.propertyIdDisplay && ` • Property ID: ${property.propertyIdDisplay}`}
            </p>
            <div className="pd-specs-row">
              {property.maxGuests && (
                <div className="pd-spec-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 110-8 4 4 0 010 8z" /></svg>
                  <span>{property.maxGuests} Guests</span>
                </div>
              )}
              {property.bedrooms && (
                <div className="pd-spec-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                  <span>{property.bedrooms} Bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="pd-spec-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.5"><path d="M2 12h20M7 7v3M17 7v3" /><rect x="2" y="10" width="20" height="10" rx="2" /></svg>
                  <span>{property.bathrooms} Bath{property.bathrooms !== 1 ? 's' : ''}</span>
                </div>
              )}
              {property.sqft && (
                <div className="pd-spec-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2zM7 21h10" /></svg>
                  <span>{property.sqft} sqft</span>
                </div>
              )}
            </div>
          </div>

          <div className="pd-info-grid">
            {property.description && (
              <div className="pd-info-section">
                <h2 className="pd-section-title">The Space</h2>
                <p className="pd-text">{property.description}</p>
              </div>
            )}

            {property.features?.length > 0 && (
              <div className="pd-info-section">
                <h2 className="pd-section-title">Features & Amenities</h2>
                <ul className="pd-features-list">
                  {property.features.map((feat, i) => <li key={i}>{feat}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* BOOKING SIDEBAR */}
        <aside className="pd-booking-sidebar">
          <div className="pd-booking-card">
            <h3 className="pd-booking-title">Reserve This Property</h3>
            <div className="pd-price-display">
              <span className="pd-price-val">$ {parseFloat(property.pricePerNight).toFixed(0)}</span>
              <span className="pd-price-unit">/ night</span>
            </div>
            <div className="pd-booking-inputs">
              <div className="pd-input-group">
                <label>Arrival</label>
                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div className="pd-input-group">
                <label>Departure</label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
              <div className="pd-input-group full-width">
                <label>Guests</label>
                <select value={numGuests} onChange={(e) => setNumGuests(Number(e.target.value))}>
                  {[...Array(property.maxGuests || 6)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
            {nights > 0 && (
              <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: '8px 0 0', textAlign: 'center' }}>
                ${parseFloat(property.pricePerNight).toFixed(0)} × {nights} night{nights !== 1 ? 's' : ''} = <strong>${basePrice.toFixed(2)}</strong>
              </p>
            )}
            <button className="pd-primary-btn" onClick={handleBookNow}>Book Now</button>
          </div>
        </aside>
      </section>

      {/* GALLERY */}
      {galleryImages.length > 1 && (
        <section className="pd-gallery">
          <div className="pd-gallery-header">
            <h2 className="pd-gallery-title libre">Visual Journal</h2>
            <p className="encode">Click on any image to expand your view.</p>
          </div>
          <div className="pd-gallery-grid-large">
            {galleryImages.map((img, index) => (
              <div key={index} className="gallery-item" onClick={() => openLightbox(index)}>
                <img src={img} alt={`Gallery ${index}`}
                  onError={(e) => { e.target.src = fallbackImg; }} />
                <div className="gallery-hover-overlay">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* REVIEWS SECTION */}
      <section className="pd-reviews-section" style={{
        padding: '60px 40px',
        maxWidth: '900px',
        margin: '0 auto 60px',
      }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 className="libre" style={{ color: '#112a3d', fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '8px' }}>
            Guest Reviews
          </h2>
          {totalReviews > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              {renderStars(Math.round(avgRating))}
              <span style={{ fontWeight: '700', color: '#112a3d', fontSize: '1.1rem' }}>{avgRating}</span>
              <span style={{ color: '#999', fontSize: '0.9rem' }}>({totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>

        {/* Existing Reviews */}
        {reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '50px' }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{
                padding: '24px',
                borderRadius: '16px',
                background: '#f9f6f1',
                border: '1px solid #e8e0d4',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: '#112a3d', color: '#f6f3eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '800', fontSize: '0.85rem',
                    }}>
                      {(rev.userName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: '700', color: '#112a3d', margin: 0, fontSize: '0.95rem' }}>
                        {rev.userName || 'Anonymous'}
                      </p>
                      <p style={{ color: '#999', margin: 0, fontSize: '0.75rem' }}>
                        {new Date(rev.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {renderStars(rev.rating)}
                </div>
                {rev.comment && (
                  <p style={{ color: '#333', lineHeight: '1.7', margin: 0, fontSize: '0.95rem' }}>{rev.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#999', marginBottom: '40px', fontStyle: 'italic' }}>No reviews yet. Be the first to share your experience!</p>
        )}

        {/* Write a Review */}
        <div style={{
          padding: '32px',
          borderRadius: '16px',
          background: '#f9f6f1',
          border: '1px solid #e8e0d4',
        }}>
          <h3 className="libre" style={{ color: '#112a3d', marginBottom: '24px', fontSize: '1.2rem' }}>
            Write a Review
          </h3>
          {reviewSuccess ? (
            <div style={{
              color: '#2e7d32', fontWeight: '700', padding: '16px', background: '#e8f5e9',
              borderRadius: '8px', textAlign: 'center',
            }}>
              ✓ Your review has been submitted and is pending admin approval. Thank you!
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block', fontSize: '0.75rem', fontWeight: '800',
                  textTransform: 'uppercase', marginBottom: '10px', color: '#112a3d', letterSpacing: '1.5px',
                }}>Your Rating</label>
                {renderStars(reviewRating, true)}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block', fontSize: '0.75rem', fontWeight: '800',
                  textTransform: 'uppercase', marginBottom: '10px', color: '#112a3d', letterSpacing: '1.5px',
                }}>Your Review</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience at this property..."
                  rows="4"
                  style={{
                    width: '100%', padding: '14px', border: '2px solid #e8e0d4',
                    borderRadius: '8px', background: '#fff', outline: 'none',
                    fontSize: '0.95rem', color: '#112a3d', resize: 'vertical',
                    fontFamily: "'Encode Sans Expanded', sans-serif",
                  }}
                />
              </div>
              {reviewError && (
                <div style={{
                  color: '#c0392b', fontSize: '0.85rem', fontWeight: '700',
                  padding: '10px', background: '#fdeaea', borderRadius: '8px', marginBottom: '16px',
                }}>{reviewError}</div>
              )}
              <button
                type="submit"
                disabled={reviewSubmitting || !isAuthenticated}
                style={{
                  padding: '14px 40px',
                  backgroundColor: reviewSubmitting ? '#ccc' : '#112a3d',
                  color: '#f6f3eb', border: 'none', borderRadius: '50px',
                  fontSize: '0.85rem', fontWeight: '800', cursor: reviewSubmitting ? 'not-allowed' : 'pointer',
                  transition: '0.3s', textTransform: 'uppercase', letterSpacing: '1.5px',
                }}
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
              {!isAuthenticated && (
                <p style={{ color: '#999', fontSize: '0.8rem', marginTop: '12px' }}>
                  You must be <a href="/login" style={{ color: '#d1a67a', fontWeight: '700' }}>logged in</a> to submit a review.
                </p>
              )}
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default PropertyDetails;