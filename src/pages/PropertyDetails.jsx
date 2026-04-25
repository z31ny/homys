import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertiesAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './PropertyDetails.css';

const fallbackImg = 'https://res.cloudinary.com/dzpswgjsm/image/upload/f_auto,q_auto,w_800/homys-static/StaysHero.png';

const isRangeBooked = (checkIn, checkOut, bookedRanges) => {
  if (!checkIn || !checkOut || !bookedRanges?.length) return false;
  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  return bookedRanges.some(({ checkIn: bci, checkOut: bco }) => ci < new Date(bco) && co > new Date(bci));
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [property, setProperty]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex]       = useState(null);
  const [checkIn, setCheckIn]   = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numGuests, setNumGuests] = useState(1);
  const [dateError, setDateError] = useState('');
  const [bookedRanges, setBookedRanges] = useState([]);
  const [reviews, setReviews]           = useState([]);
  const [avgRating, setAvgRating]       = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError]   = useState('');
  const [hoverStar, setHoverStar]       = useState(0);

  useEffect(() => {
    if (!id) { setError('No property selected.'); setLoading(false); return; }

    propertiesAPI.getById(id)
      .then((res) => setProperty(res.data.property))
      .catch((err) => setError(err.message || 'Property not found.'))
      .finally(() => setLoading(false));

    propertiesAPI.getAvailability(id)
      .then((res) => setBookedRanges(res.data.bookedRanges || []))
      .catch(() => {});

    reviewsAPI.getByProperty(id)
      .then((res) => {
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.averageRating || 0);
        setTotalReviews(res.data.totalReviews || 0);
      })
      .catch(() => {});
  }, [id]);

  const validateDates = (ci, co) => {
    if (!ci || !co) { setDateError(''); return true; }
    if (new Date(co) <= new Date(ci)) { setDateError('Departure must be after arrival.'); return false; }
    if (isRangeBooked(ci, co, bookedRanges)) { setDateError('These dates are already booked. Please choose different dates.'); return false; }
    setDateError('');
    return true;
  };

  const handleCheckInChange  = (e) => { setCheckIn(e.target.value);  if (checkOut) validateDates(e.target.value, checkOut); else setDateError(''); };
  const handleCheckOutChange = (e) => { setCheckOut(e.target.value); validateDates(checkIn, e.target.value); };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { setReviewError('Please log in to submit a review.'); return; }
    setReviewError(''); setReviewSubmitting(true);
    try {
      await reviewsAPI.create({ propertyId: id, rating: reviewRating, comment: reviewComment });
      setReviewSuccess(true); setReviewComment(''); setReviewRating(5);
    } catch (err) { setReviewError(err.message || 'Failed to submit review.'); }
    finally { setReviewSubmitting(false); }
  };

  if (loading) return (
    <div className="property-details-page" style={{ padding: '120px 40px', textAlign: 'center' }}>
      <p style={{ opacity: 0.5, fontSize: '1.1rem' }}>Loading property…</p>
    </div>
  );

  if (error || !property) return (
    <div className="property-details-page" style={{ padding: '120px 40px', textAlign: 'center' }}>
      <h2 style={{ marginBottom: 16 }}>Property Not Found</h2>
      <p style={{ opacity: 0.6, marginBottom: 32 }}>{error || 'This property does not exist or is unavailable.'}</p>
      <button className="pd-primary-btn" onClick={() => navigate('/stays')}>Back to Stays</button>
    </div>
  );

  const heroImages   = property.images?.length > 0 ? property.images.map((i) => i.imageUrl) : [fallbackImg];
  const galleryImages = heroImages;
  const nextHero     = () => setCurrentHeroIndex((p) => (p === heroImages.length - 1 ? 0 : p + 1));
  const prevHero     = () => setCurrentHeroIndex((p) => (p === 0 ? heroImages.length - 1 : p - 1));
  const openLightbox  = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const nextLightbox  = (e) => { e.stopPropagation(); setLightboxIndex((p) => (p === galleryImages.length - 1 ? 0 : p + 1)); };
  const prevLightbox  = (e) => { e.stopPropagation(); setLightboxIndex((p) => (p === 0 ? galleryImages.length - 1 : p - 1)); };

  const nights    = checkIn && checkOut ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 0;
  const basePrice = nights * parseFloat(property.pricePerNight || 0);
  const datesValid = !dateError && checkIn && checkOut && nights > 0;

  const handleBookNow = () => {
    const valid = validateDates(checkIn, checkOut);
    if (!checkIn || !checkOut) { setDateError('Please select check-in and check-out dates.'); return; }
    if (!valid) return;
    if (!isAuthenticated) {
      sessionStorage.setItem('homys_pending_booking', JSON.stringify({ propertyId: property.id, checkIn, checkOut, numGuests }));
      navigate('/login', { state: { returnTo: `/stays/${property.id}` } });
      return;
    }
    navigate('/cart', { state: { propertyId: property.id, title: property.title, locationName: property.locationName, heroImageUrl: heroImages[0], pricePerNight: parseFloat(property.pricePerNight), checkIn, checkOut, nights, numGuests, basePrice } });
  };

  const renderStars = (rating, interactive = false) => (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width={interactive ? 28 : 16} height={interactive ? 28 : 16} viewBox="0 0 24 24"
          fill={star <= (interactive ? (hoverStar || reviewRating) : rating) ? '#d1a67a' : 'none'}
          stroke={star <= (interactive ? (hoverStar || reviewRating) : rating) ? '#d1a67a' : '#ccc'}
          strokeWidth="1.5" style={interactive ? { cursor: 'pointer' } : {}}
          onClick={interactive ? () => setReviewRating(star) : undefined}
          onMouseEnter={interactive ? () => setHoverStar(star) : undefined}
          onMouseLeave={interactive ? () => setHoverStar(0) : undefined}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );

  // Description bullets — stored as newline-separated text
  const descriptionBullets = property.description
    ? property.description.split('\n').map((l) => l.trim()).filter(Boolean)
    : [];

  return (
    <div className="property-details-page">

      {/* LIGHTBOX */}
      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lb-close" onClick={closeLightbox}>✕</button>
          <button className="lb-nav lb-prev" onClick={prevLightbox}>‹</button>
          <div className="lb-content">
            <img src={galleryImages[lightboxIndex]} alt="Zoomed" className="lb-img" onError={(e) => { e.target.src = fallbackImg; }} />
          </div>
          <button className="lb-nav lb-next" onClick={nextLightbox}>›</button>
          <div className="lb-counter">{lightboxIndex + 1} / {galleryImages.length}</div>
        </div>
      )}

      {/* HERO */}
      <section className="pd-hero">
        <div className="pd-hero-slider">
          <img src={heroImages[currentHeroIndex]} alt="Hero" className="pd-hero-img" onError={(e) => { e.target.src = fallbackImg; }} />
          {heroImages.length > 1 && (
            <>
              <button className="pd-nav-btn prev" onClick={prevHero}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg></button>
              <button className="pd-nav-btn next" onClick={nextHero}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg></button>
            </>
          )}
        </div>
      </section>

      <section className="pd-main-container">
        <div className="pd-left-content">
          {/* Header */}
          <div className="pd-header">
            <h1 className="pd-title">{property.title}</h1>
            <p className="pd-location">{property.locationName}{property.propertyIdDisplay && ` • Property ID: ${property.propertyIdDisplay}`}</p>

            {/* Discount badge */}
            {property.discountPercent && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fdeaea', border: '1.5px solid #f5c6c6', borderRadius: 50, padding: '6px 16px', marginBottom: 12 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" /></svg>
                <span style={{ color: '#c0392b', fontWeight: 800, fontSize: '0.82rem' }}>
                  {parseFloat(property.discountPercent).toFixed(0)}% OFF
                  {property.discountLabel ? ` — ${property.discountLabel}` : ''}
                </span>
              </div>
            )}

            <div className="pd-specs-row">
              {property.maxGuests && <div className="pd-spec-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 110-8 4 4 0 010 8z" /></svg><span>{property.maxGuests} Guests</span></div>}
              {property.bedrooms && <div className="pd-spec-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg><span>{property.bedrooms} Bedroom{property.bedrooms !== 1 ? 's' : ''}</span></div>}
              {property.bathrooms && <div className="pd-spec-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.5"><path d="M2 12h20M7 7v3M17 7v3" /><rect x="2" y="10" width="20" height="10" rx="2" /></svg><span>{property.bathrooms} Bath{property.bathrooms !== 1 ? 's' : ''}</span></div>}
            </div>
          </div>

          <div className="pd-info-grid">
            {/* Description as bullet points */}
            {descriptionBullets.length > 0 && (
              <div className="pd-info-section">
                <h2 className="pd-section-title">The Space</h2>
                <ul className="pd-features-list">
                  {descriptionBullets.map((line, i) => <li key={i}>{line}</li>)}
                </ul>
              </div>
            )}

            {/* Amenities */}
            {property.features?.length > 0 && (
              <div className="pd-info-section">
                <h2 className="pd-section-title">Features & Amenities</h2>
                <ul className="pd-features-list">
                  {property.features.map((feat, i) => <li key={i}>{feat}</li>)}
                </ul>
              </div>
            )}

            {/* House Rules */}
            {property.houseRules?.length > 0 && (
              <div className="pd-info-section">
                <h2 className="pd-section-title">House Rules</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                  {property.houseRules.map((rule, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f2ec', border: '1.5px solid #e0d9ce', borderRadius: 50, padding: '7px 16px', fontSize: '0.83rem', fontWeight: 600, color: '#112a3d', fontFamily: "'Encode Sans Expanded', sans-serif" }}>
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOOKING SIDEBAR */}
        <aside className="pd-booking-sidebar">
          <div className="pd-booking-card">
            <h3 className="pd-booking-title">Reserve This Property</h3>
            <div className="pd-price-display">
              {property.originalPricePerNight && (
                <span style={{ textDecoration: 'line-through', opacity: 0.45, fontSize: '0.95rem', marginRight: 8 }}>
                  ${parseFloat(property.originalPricePerNight).toFixed(0)}
                </span>
              )}
              <span className="pd-price-val">$ {parseFloat(property.pricePerNight).toFixed(0)}</span>
              <span className="pd-price-unit">/ night</span>
            </div>

            <div className="pd-booking-inputs">
              <div className="pd-input-group">
                <label>Arrival</label>
                <input type="date" value={checkIn} min={new Date().toISOString().split('T')[0]} onChange={handleCheckInChange} style={dateError ? { borderColor: '#ef4444' } : {}} />
              </div>
              <div className="pd-input-group">
                <label>Departure</label>
                <input type="date" value={checkOut} min={checkIn || new Date().toISOString().split('T')[0]} onChange={handleCheckOutChange} style={dateError ? { borderColor: '#ef4444' } : {}} />
              </div>
              <div className="pd-input-group full-width">
                <label>Guests</label>
                <select value={numGuests} onChange={(e) => setNumGuests(Number(e.target.value))}>
                  {[...Array(Math.max(property.maxGuests || 6, 2))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {dateError && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#fdeaea', border: '1px solid #f5c6c6', borderRadius: 10, padding: '10px 14px', margin: '4px 0 8px', fontSize: '0.83rem', color: '#c0392b', fontWeight: 600, lineHeight: 1.45 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {dateError}
              </div>
            )}

            {datesValid && (
              <p style={{ fontSize: '0.85rem', opacity: 0.7, margin: '4px 0 8px', textAlign: 'center' }}>
                ${parseFloat(property.pricePerNight).toFixed(0)} × {nights} night{nights !== 1 ? 's' : ''} = <strong>${basePrice.toFixed(2)}</strong>
              </p>
            )}

            <button className="pd-primary-btn" onClick={handleBookNow} disabled={!!dateError && checkIn && checkOut} style={dateError && checkIn && checkOut ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
              Book Now
            </button>
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
                <img src={img} alt={`Gallery ${index}`} onError={(e) => { e.target.src = fallbackImg; }} />
                <div className="gallery-hover-overlay">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* REVIEWS */}
      <section className="pd-reviews-section" style={{ padding: '60px 40px', maxWidth: 900, margin: '0 auto 60px' }}>
        <div style={{ marginBottom: 40 }}>
          <h2 className="libre" style={{ color: '#112a3d', fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 8 }}>Guest Reviews</h2>
          {totalReviews > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              {renderStars(Math.round(avgRating))}
              <span style={{ fontWeight: 700, color: '#112a3d', fontSize: '1.1rem' }}>{avgRating}</span>
              <span style={{ color: '#999', fontSize: '0.9rem' }}>({totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>

        {reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 50 }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{ padding: 24, borderRadius: 16, background: '#f9f6f1', border: '1px solid #e8e0d4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#112a3d', color: '#f6f3eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                      {(rev.userName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#112a3d', margin: 0, fontSize: '0.95rem' }}>{rev.userName || 'Anonymous'}</p>
                      <p style={{ color: '#999', margin: 0, fontSize: '0.75rem' }}>{new Date(rev.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  {renderStars(rev.rating)}
                </div>
                {rev.comment && <p style={{ color: '#333', lineHeight: 1.7, margin: 0, fontSize: '0.95rem' }}>{rev.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#999', marginBottom: 40, fontStyle: 'italic' }}>No reviews yet. Be the first to share your experience!</p>
        )}

        {/* Write a Review */}
        <div style={{ padding: 32, borderRadius: 16, background: '#f9f6f1', border: '1px solid #e8e0d4' }}>
          <h3 className="libre" style={{ color: '#112a3d', marginBottom: 24, fontSize: '1.2rem' }}>Write a Review</h3>
          {reviewSuccess ? (
            <div style={{ color: '#2e7d32', fontWeight: 700, padding: 16, background: '#e8f5e9', borderRadius: 8, textAlign: 'center' }}>
              ✓ Your review has been submitted and is pending admin approval. Thank you!
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 10, color: '#112a3d', letterSpacing: '1.5px' }}>Your Rating</label>
                {renderStars(reviewRating, true)}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 10, color: '#112a3d', letterSpacing: '1.5px' }}>Your Review</label>
                <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Share your experience at this property..." rows="4"
                  style={{ width: '100%', padding: 14, border: '2px solid #e8e0d4', borderRadius: 8, background: '#fff', outline: 'none', fontSize: '0.95rem', color: '#112a3d', resize: 'vertical', fontFamily: "'Encode Sans Expanded', sans-serif" }} />
              </div>
              {reviewError && <div style={{ color: '#c0392b', fontSize: '0.85rem', fontWeight: 700, padding: 10, background: '#fdeaea', borderRadius: 8, marginBottom: 16 }}>{reviewError}</div>}
              <button type="submit" disabled={reviewSubmitting || !isAuthenticated}
                style={{ padding: '14px 40px', backgroundColor: reviewSubmitting ? '#ccc' : '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 50, fontSize: '0.85rem', fontWeight: 800, cursor: reviewSubmitting ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
              {!isAuthenticated && <p style={{ color: '#999', fontSize: '0.8rem', marginTop: 12 }}>You must be <a href="/login" style={{ color: '#d1a67a', fontWeight: 700 }}>logged in</a> to submit a review.</p>}
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default PropertyDetails;
