import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { propertiesAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCMS } from '../useCMS';
import { staticUrl } from '../staticAssets';
import './PropertyDetails.css';

// ─── Homys Rules CMS defaults ─────────────────────────────────────────────
const HOMYS_RULES_DEFAULTS = {
  col1Title: 'Cancellation & Changes',
  col1Icon: '📋',
  col1Rules: [
    'Free cancellation up to 7 days before check-in',
    '50% refund for cancellations 3–7 days before check-in',
    'No refund within 3 days of check-in',
    'Date changes subject to availability and may incur fees',
    'No-shows are treated as non-cancellations',
  ],
  col2Title: 'Guest Regulations',
  col2Icon: '👥',
  col2Rules: [
    'No parties, events, or large gatherings',
    'No mixed groups',
    'Strictly no smoking indoors',
    'Pets allowed only with prior written approval',
    'Quiet hours: 10 PM – 8 AM',
    'Maximum occupancy as listed — no exceptions',
  ],
  col3Title: 'House Rules',
  col3Icon: '🏠',
  col3Rules: [
    'Check-in 3:00 PM, check-out 12:00 PM',
    'Please keep the property clean and tidy',
    'Report any damage or breakage immediately',
    'All amenities are for registered guests only',
    'Do not rearrange or remove any furniture',
  ],
};

const fallbackImg = staticUrl('StaysHero.png', 'f_auto,q_auto,w_800');

// ─── Label badge styles ───────────────────────────────────────────────────
const LABEL_META = {
  best_seller:    { text: 'Best Seller',    icon: '🏆', bg: '#fff8e1', color: '#b45309', border: '#fcd34d' },
  guest_favorite: { text: 'Guest Favorite', icon: '❤️', bg: '#fdf2f8', color: '#9d174d', border: '#f9a8d4' },
  new:            { text: 'New Listing',    icon: '✦',  bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7' },
};

// ─── Calendar helpers ─────────────────────────────────────────────────────
const toYMD = (d) => d.toISOString().split('T')[0];
const addDays = (dateStr, n) => { const d = new Date(dateStr + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return toYMD(d); };

const buildBookedSet = (bookedRanges) => {
  const set = new Set();
  bookedRanges.forEach(({ checkIn, checkOut }) => {
    let cur = checkIn;
    while (cur < checkOut) { set.add(cur); cur = addDays(cur, 1); }
  });
  return set;
};

const isRangeBooked = (checkIn, checkOut, bookedRanges) => {
  if (!checkIn || !checkOut || !bookedRanges?.length) return false;
  return bookedRanges.some(({ checkIn: bci, checkOut: bco }) => checkIn < bco && checkOut > bci);
};

// ─── Mini calendar component ──────────────────────────────────────────────
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const MiniCalendar = ({ bookedSet, checkIn, checkOut, onSelectDate, minimumStay }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); } else setViewMonth((m) => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); } else setViewMonth((m) => m + 1); };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = toYMD(today);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push(dateStr);
  }

  return (
    <div className="mini-cal-wrap">
      {/* Header */}
      <div className="mini-cal-header">
        <button type="button" className="mini-cal-arrow" aria-label="Previous month" onClick={prevMonth}>‹</button>
        <span className="mini-cal-month">{MONTHS[viewMonth]} {viewYear}</span>
        <button type="button" className="mini-cal-arrow" aria-label="Next month" onClick={nextMonth}>›</button>
      </div>

      {/* Day names */}
      <div className="mini-cal-grid">
        {DAYS.map((d) => <div key={d} className="mini-cal-dayname">{d}</div>)}
      </div>

      {/* Date cells */}
      <div className="mini-cal-grid">
        {cells.map((dateStr, i) => {
          if (!dateStr) return <div key={`empty-${i}`} />;

          const isPast = dateStr < todayStr;
          const isBooked = bookedSet.has(dateStr);
          const isCheckIn = dateStr === checkIn;
          const isCheckOut = dateStr === checkOut;
          const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;
          const isDisabled = isPast || isBooked;

          let bg = 'transparent';
          let color = '#112a3d';
          let fontWeight = 400;
          let opacity = 1;
          let borderRadius = '50%';
          let textDecoration = 'none';

          if (isPast) { color = '#ccc'; opacity = 0.5; }
          if (isBooked && !isPast) { bg = '#fde8e8'; color = '#ef4444'; fontWeight = 600; textDecoration = 'line-through'; opacity = 0.7; }
          if (isInRange) { bg = '#e8f0fc'; borderRadius = '0'; }
          if (isCheckIn || isCheckOut) { bg = '#112a3d'; color = '#f6f3eb'; fontWeight = 800; }

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => !isDisabled && onSelectDate(dateStr)}
              disabled={isDisabled}
              title={isBooked ? 'Already booked' : undefined}
              className="mini-cal-cell"
              style={{ background: bg, color, fontWeight, borderRadius, opacity, textDecoration }}
            >
              {new Date(dateStr + 'T00:00:00').getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mini-cal-legend">
        <div className="mini-cal-legend-item">
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#fde8e8', border: '1px solid #ef4444' }} />
          Booked
        </div>
        <div className="mini-cal-legend-item">
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#112a3d' }} />
          Selected
        </div>
        <div className="mini-cal-legend-item">
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#e8f0fc' }} />
          Your stay
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────
const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const homysRules = useCMS('property_homys_rules', HOMYS_RULES_DEFAULTS);

  const [property, setProperty]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex]       = useState(null);
  const [checkIn, setCheckIn]   = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numGuests, setNumGuests] = useState(1);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [dateError, setDateError] = useState('');
  const [bookedRanges, setBookedRanges] = useState([]);
  const [bookedSet, setBookedSet]       = useState(new Set());
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarStep, setCalendarStep] = useState('checkIn'); // 'checkIn' | 'checkOut'
  const [reviews, setReviews]       = useState([]);
  const [avgRating, setAvgRating]   = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError]   = useState('');
  const [hoverStar, setHoverStar]       = useState(0);
  const [rulesExpanded, setRulesExpanded] = useState([false, false, false]);
  const heroTrackRef                      = useRef(null);

  useEffect(() => {
    if (!id) { setError('No property selected.'); setLoading(false); return; }
    propertiesAPI.getById(id).then((res) => setProperty(res.data.property)).catch((err) => setError(err.message || 'Property not found.')).finally(() => setLoading(false));
    propertiesAPI.getAvailability(id).then((res) => {
      const ranges = res.data.bookedRanges || [];
      setBookedRanges(ranges);
      setBookedSet(buildBookedSet(ranges));
    }).catch(() => {});
    reviewsAPI.getByProperty(id).then((res) => { setReviews(res.data.reviews || []); setAvgRating(res.data.averageRating || 0); setTotalReviews(res.data.totalReviews || 0); }).catch(() => {});
  }, [id]);

  const minimumStay = property?.minimumStay || 1;

  const validateDates = useCallback((ci, co) => {
    if (!ci || !co) { setDateError(''); return true; }
    if (new Date(co) <= new Date(ci)) { setDateError('Departure must be after arrival.'); return false; }
    const nights = Math.ceil((new Date(co) - new Date(ci)) / 86400000);
    if (nights < minimumStay) { setDateError(`This property requires a minimum stay of ${minimumStay} night${minimumStay > 1 ? 's' : ''}.`); return false; }
    if (isRangeBooked(ci, co, bookedRanges)) { setDateError('These dates are already booked. Please choose different dates.'); return false; }
    setDateError(''); return true;
  }, [bookedRanges, minimumStay]);

  const handleCalendarSelect = (dateStr) => {
    if (calendarStep === 'checkIn') {
      setCheckIn(dateStr);
      setCheckOut('');
      setCalendarStep('checkOut');
      setDateError('');
    } else {
      if (dateStr <= checkIn) { setDateError('Departure must be after arrival.'); return; }
      // auto-calculate minimum checkout
      const minCheckout = addDays(checkIn, minimumStay);
      if (dateStr < minCheckout) { setDateError(`Minimum stay is ${minimumStay} night${minimumStay > 1 ? 's' : ''}. Earliest checkout: ${minCheckout}.`); return; }
      setCheckOut(dateStr);
      setCalendarStep('checkIn');
      validateDates(checkIn, dateStr);
      setShowCalendar(false);
    }
  };

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

  if (loading) return <div className="property-details-page" style={{ padding: '120px 40px', textAlign: 'center' }}><p style={{ opacity: 0.5 }}>Loading property…</p></div>;
  if (error || !property) return <div className="property-details-page" style={{ padding: '120px 40px', textAlign: 'center' }}><h2>Property Not Found</h2><p style={{ opacity: 0.6, marginBottom: 32 }}>{error}</p><button className="pd-primary-btn" onClick={() => navigate('/stays')}>Back to Stays</button></div>;

  const heroImages = property.images?.length > 0 ? property.images.map((i) => i.imageUrl) : [fallbackImg];
  
  const nextHero = () => {
    if (heroTrackRef.current) {
      heroTrackRef.current.scrollBy({ left: heroTrackRef.current.clientWidth, behavior: 'smooth' });
    }
  };
  
  const prevHero = () => {
    if (heroTrackRef.current) {
      heroTrackRef.current.scrollBy({ left: -heroTrackRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const handleHeroScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const clientWidth = e.target.clientWidth;
    const newIndex = Math.round(scrollLeft / clientWidth);
    if (newIndex !== currentHeroIndex && newIndex >= 0 && newIndex < heroImages.length) {
      setCurrentHeroIndex(newIndex);
    }
  };
  const openLightbox  = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const nextLightbox  = (e) => { e.stopPropagation(); setLightboxIndex((p) => (p === heroImages.length - 1 ? 0 : p + 1)); };
  const prevLightbox  = (e) => { e.stopPropagation(); setLightboxIndex((p) => (p === 0 ? heroImages.length - 1 : p - 1)); };

  const nights    = checkIn && checkOut ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 0;
  const hasDiscount = !!property.discountPercent && parseFloat(property.discountPercent) > 0;
  const discountPct = hasDiscount ? parseFloat(property.discountPercent) : 0;
  // Backend already computes the discounted price into pricePerNight; originalPricePerNight is the base
  const effectivePPN = parseFloat(property.pricePerNight || 0);
  const basePPN = hasDiscount && property.originalPricePerNight
    ? parseFloat(property.originalPricePerNight)
    : effectivePPN;
  const basePrice = nights * effectivePPN;
  const datesValid = !dateError && checkIn && checkOut && nights > 0;
  const labelMeta = LABEL_META[property.propertyLabel];

  const handleBookNow = () => {
    const valid = validateDates(checkIn, checkOut);
    if (!checkIn || !checkOut) { setDateError('Please select check-in and check-out dates.'); return; }
    if (!valid) return;
    if (!isAuthenticated) {
      sessionStorage.setItem('homys_pending_booking', JSON.stringify({ propertyId: property.id, checkIn, checkOut, numGuests }));
      navigate('/login', { state: { returnTo: `/stays/${property.id}` } });
      return;
    }
    navigate('/cart', { state: { propertyId: property.id, title: property.title, locationName: property.locationName, heroImageUrl: heroImages[0], pricePerNight: effectivePPN, checkIn, checkOut, nights, numGuests, basePrice, offersHousekeeping: !!property.offersHousekeeping, offersBeachAccess: !!property.offersBeachAccess, beachAccessPrice: property.beachAccessPrice != null ? parseFloat(property.beachAccessPrice) : 2000, serviceFeePercent: property.serviceFeePercent != null ? parseFloat(property.serviceFeePercent) : 10 } });
  };

  const renderStars = (rating, interactive = false) => (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map((star) => (
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

  const descriptionBullets = property.description ? property.description.split('\n').map((l) => l.trim()).filter(Boolean) : [];
  const displayType = property.propertyType === 'other' && property.propertyTypeOther ? property.propertyTypeOther : property.propertyType;
  const displayView = property.viewType === 'other' && property.viewTypeOther ? property.viewTypeOther : property.viewType;

  return (
    <div className="property-details-page">

      {/* LIGHTBOX */}
      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lb-close" onClick={closeLightbox}>✕</button>
          <button className="lb-nav lb-prev" onClick={prevLightbox}>‹</button>
          <div className="lb-content"><img src={heroImages[lightboxIndex]} alt="Zoomed" className="lb-img" onError={(e) => { e.target.src = fallbackImg; }} /></div>
          <button className="lb-nav lb-next" onClick={nextLightbox}>›</button>
          <div className="lb-counter">{lightboxIndex + 1} / {heroImages.length}</div>
        </div>
      )}

      {/* ── HERO: full-width image slider ── */}
      <section className="pd-hero">
        <div className="pd-hero-track" ref={heroTrackRef} onScroll={handleHeroScroll}>
          {heroImages.map((imgUrl, index) => (
            <div key={index} className="pd-hero-slide">
              <img
                src={imgUrl}
                alt={property.title}
                className="pd-hero-img"
                loading={index === 0 ? 'eager' : 'lazy'}
                onError={(e) => { e.target.src = fallbackImg; }}
              />
              <div className="pd-hero-gradient" />

              {/* Title + badge — top-left (only show on the first slide to avoid duplication) */}
              {index === 0 && (
                <div className="pd-hero-overlay">
                  {labelMeta && (
                    <span className={`pd-hero-label-badge lbl-${property.propertyLabel?.replace('_','')}`}>
                      {labelMeta.text}
                    </span>
                  )}
                  <h1 className="pd-hero-title">{property.title}</h1>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Show all photos — bottom-left */}
        <button className="pd-show-all-btn" onClick={() => openLightbox(0)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
          Show all photos
        </button>


        {/* Both arrows — on pd-hero so they're never clipped */}
        {heroImages.length > 1 && (
          <>
            <button className="pd-nav-btn prev" onClick={prevHero} aria-label="Previous photo">‹</button>
            <button className="pd-nav-btn next" onClick={nextHero} aria-label="Next photo">›</button>
          </>
        )}

        {/* Photo counter */}
        {heroImages.length > 1 && (
          <div className="pd-hero-counter">
            {currentHeroIndex + 1} / {heroImages.length}
          </div>
        )}
      </section>


      {/* ── CONTENT ── */}
      <div className="pd-content-wrap">

        {/* Overview row: text left | image right */}
        <div className="pd-overview-row">
          <div className="pd-overview-col">
            <p className="pd-location">
              {property.locationName}{property.propertyIdDisplay && ` · ID: ${property.propertyIdDisplay}`}
            </p>

            {/* Badges */}
            {(labelMeta || hasDiscount || minimumStay > 1) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {labelMeta && (
                  <div className="pd-property-label-badge" style={{ '--lbg': labelMeta.bg, '--lcolor': labelMeta.color, '--lborder': labelMeta.border }}>
                    {labelMeta.text}
                  </div>
                )}
                {hasDiscount && (
                  <div className="pd-discount-strip">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01"/></svg>
                    <strong>{discountPct.toFixed(0)}% OFF</strong>
                    {property.discountLabel && <span className="pd-discount-label-text">{property.discountLabel}</span>}
                  </div>
                )}
                {minimumStay > 1 && (
                  <div className="pd-minstay-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 110 20A10 10 0 0112 2zM12 6v6l4 2"/></svg>
                    {minimumStay}-night minimum
                  </div>
                )}
              </div>
            )}

            {/* Overview text */}
            {property.description && (
              <div className="pd-overview-block">
                <h2 className="pd-section-title">Overview</h2>
                <p className="pd-overview-text">{property.description}</p>
              </div>
            )}

            {/* Payment & cancellation if available */}
            {property.cancellationPolicy && (
              <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.8, marginTop: 8 }}>{property.cancellationPolicy}</p>
            )}

            {/* Spec rows */}
            <div className="pd-spec-rows">
              {property.bedrooms > 0 && (
                <div className="pd-spec-row">
                  <div className="pd-spec-left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 9V19M22 9V19M2 14h20M7 14V9M17 14V9M2 9a5 5 0 015-5h10a5 5 0 015 5"/></svg>
                    No. of bedrooms
                  </div>
                  <strong>{property.bedrooms} Bedroom{property.bedrooms !== 1 ? 's' : ''}</strong>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="pd-spec-row">
                  <div className="pd-spec-left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12h20M7 7v3M17 7v3"/><rect x="2" y="10" width="20" height="10" rx="2"/></svg>
                    No. of bathrooms
                  </div>
                  <strong>{property.bathrooms} Bathroom{property.bathrooms !== 1 ? 's' : ''}</strong>
                </div>
              )}
              {property.maxGuests > 0 && (
                <div className="pd-spec-row">
                  <div className="pd-spec-left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 110-8 4 4 0 010 8z"/></svg>
                    Guests
                  </div>
                  <strong>Up to {property.maxGuests} guest{property.maxGuests !== 1 ? 's' : ''}</strong>
                </div>
              )}
              {displayType && (
                <div className="pd-spec-row">
                  <div className="pd-spec-left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                    Property type
                  </div>
                  <strong style={{ textTransform: 'capitalize' }}>{displayType}</strong>
                </div>
              )}
              {displayView && (
                <div className="pd-spec-row">
                  <div className="pd-spec-left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                    View
                  </div>
                  <strong style={{ textTransform: 'capitalize' }}>{displayView} view</strong>
                </div>
              )}
            </div>
          </div>

          {/* Sticky right image */}
          <div className="pd-overview-img">
            <img src={heroImages[0]} alt={property.title} onError={(e) => { e.target.src = fallbackImg; }} />
          </div>
        </div>

        {/* Amenities: image left | grid right */}
        {(property.amenities?.length > 0 || property.features?.length > 0) && (
          <div className="pd-amenities-row">
            <div className="pd-amenities-img">
              <img src={heroImages[1] || heroImages[0]} alt="Interior" onError={(e) => { e.target.src = fallbackImg; }} />
            </div>
            <div className="pd-amenities-col">
              <h2 className="pd-section-title">Amenities</h2>
              <p className="pd-amenities-category">Property</p>
              <div className="pd-amenities-2col">
                {[...(property.amenities || []), ...(property.features || [])]
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .map((item, i) => (
                    <div key={i} className="pd-amenity-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>{item}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* House Rules */}
        {property.houseRules?.length > 0 && (
          <div className="pd-rules-block">
            <h2 className="pd-section-title">House Rules</h2>
            <div className="pd-rules-tags">
              {property.houseRules.map((rule, i) => (
                <span key={i} className="pd-rule-tag">{rule}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Homys Rules ── */}
        {(() => {
          const cols = [
            { title: homysRules.col1Title, icon: homysRules.col1Icon, rules: homysRules.col1Rules || [] },
            { title: homysRules.col2Title, icon: homysRules.col2Icon, rules: homysRules.col2Rules || [] },
            { title: homysRules.col3Title, icon: homysRules.col3Icon, rules: homysRules.col3Rules || [] },
          ];
          const PREVIEW = 3;
          return (
            <div className="pd-homys-rules-block">
              <div className="pd-homys-rules-header">
                <h2 className="pd-section-title" style={{ margin: 0 }}>Homys Rules</h2>
                <p className="pd-homys-rules-sub">Please read before your stay</p>
              </div>
              <div className="pd-homys-rules-grid">
                {cols.map((col, ci) => {
                  const expanded = rulesExpanded[ci];
                  const visible = expanded ? col.rules : col.rules.slice(0, PREVIEW);
                  const hasMore = col.rules.length > PREVIEW;
                  return (
                    <div key={ci} className="pd-homys-rules-col">
                      <div className="pd-homys-rules-col-head">
                        <span className="pd-homys-rules-icon">{col.icon}</span>
                        <h3 className="pd-homys-rules-col-title">{col.title}</h3>
                      </div>
                      <ul className="pd-homys-rules-list">
                        {visible.map((rule, ri) => (
                          <li key={ri} className="pd-homys-rules-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1a67a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                      {hasMore && (
                        <button
                          className="pd-homys-rules-toggle"
                          onClick={() => setRulesExpanded((prev) => { const n = [...prev]; n[ci] = !n[ci]; return n; })}
                        >
                          {expanded ? '− Show less' : `+ ${col.rules.length - PREVIEW} more`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Location */}
        {property.locationName && (
          <div className="pd-location-block">
            <div className="pd-location-map">
              <iframe
                title="Property Location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(property.locationName + ', Egypt')}&output=embed&z=14`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="pd-location-info">
              <h2 className="pd-section-title">Location</h2>
              <p className="pd-location-name">{property.locationName}</p>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(property.locationName + ', Egypt')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pd-maps-btn"
              >
                Show on maps
              </a>
            </div>
          </div>
        )}
      </div>

      {/* REVIEWS */}
      <section className="pd-reviews-section" style={{ padding: '60px 40px 160px', maxWidth: 900, margin: '0 auto' }}>
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
                  style={{ width: '100%', padding: 14, border: '2px solid #e8e0d4', borderRadius: 8, background: '#fff', outline: 'none', fontSize: '0.95rem', color: '#112a3d', resize: 'vertical', fontFamily: "'Encode Sans Expanded', sans-serif", boxSizing: 'border-box' }} />
              </div>
              {reviewError && <div style={{ color: '#c0392b', fontSize: '0.85rem', fontWeight: 700, padding: 10, background: '#fdeaea', borderRadius: 8, marginBottom: 16 }}>{reviewError}</div>}
              <button type="submit" disabled={reviewSubmitting || !isAuthenticated}
                style={{ padding: '14px 40px', backgroundColor: reviewSubmitting ? '#ccc' : '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 50, fontSize: '0.85rem', fontWeight: 800, cursor: reviewSubmitting ? 'not-allowed' : 'pointer', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
              {!isAuthenticated && <p style={{ color: '#999', fontSize: '0.8rem', marginTop: 12 }}>You must be <Link to="/login" style={{ color: '#d1a67a', fontWeight: 700 }}>logged in</Link> to submit a review.</p>}
            </form>
          )}
        </div>
      </section>

      {/* ── STICKY BOOKING BAR ── */}
      <div className="pd-sticky-bar">
        {showCalendar && (
          <div className="pd-sticky-cal-popup">
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button onClick={() => setCalendarStep('checkIn')}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1.5px solid', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit',
                  background: calendarStep === 'checkIn' ? '#112a3d' : '#fff',
                  color: calendarStep === 'checkIn' ? '#f6f3eb' : '#112a3d',
                  borderColor: calendarStep === 'checkIn' ? '#112a3d' : '#e0d9ce' }}>
                1. Check-in
              </button>
              <button onClick={() => { if (checkIn) setCalendarStep('checkOut'); }} disabled={!checkIn}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1.5px solid', fontWeight: 700, fontSize: '0.8rem', cursor: checkIn ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                  background: calendarStep === 'checkOut' ? '#112a3d' : '#fff',
                  color: calendarStep === 'checkOut' ? '#f6f3eb' : '#112a3d',
                  borderColor: calendarStep === 'checkOut' ? '#112a3d' : '#e0d9ce',
                  opacity: checkIn ? 1 : 0.4 }}>
                2. Check-out
              </button>
            </div>
            {calendarStep === 'checkOut' && minimumStay > 1 && (
              <p style={{ fontSize: '0.75rem', color: '#f57f17', fontWeight: 700, margin: '0 0 8px', textAlign: 'center' }}>
                Min {minimumStay} nights — earliest checkout: {checkIn ? addDays(checkIn, minimumStay) : '—'}
              </p>
            )}
            <MiniCalendar bookedSet={bookedSet} checkIn={checkIn} checkOut={checkOut} onSelectDate={handleCalendarSelect} minimumStay={minimumStay} />
            {dateError && (
              <p style={{ color: '#c0392b', fontSize: '0.8rem', fontWeight: 700, marginTop: 8 }}>{dateError}</p>
            )}
            {datesValid && (
              <p style={{ fontSize: '0.82rem', color: '#555', marginTop: 8, textAlign: 'center' }}>
                EGP {effectivePPN.toLocaleString('en', { maximumFractionDigits: 0 })} × {nights} night{nights !== 1 ? 's' : ''} = <strong style={{ color: '#112a3d' }}>EGP {basePrice.toLocaleString('en', { maximumFractionDigits: 0 })}</strong>
              </p>
            )}
            <button onClick={() => setShowCalendar(false)}
              style={{ width: '100%', marginTop: 10, padding: '8px', border: '1px solid #e0d9ce', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', color: '#666', fontFamily: 'inherit' }}>
              Done
            </button>
          </div>
        )}
        <div className="pd-sticky-inner">
          <div className="pd-sticky-field" onClick={() => { setShowCalendar(true); setCalendarStep('checkIn'); }}>
            <span>Check-in</span>
            <strong>{checkIn || 'Select a date'}</strong>
          </div>
          <div className="pd-sticky-sep" />
          <div className="pd-sticky-field" style={{ cursor: checkIn ? 'pointer' : 'default' }}
            onClick={() => { if (checkIn) { setShowCalendar(true); setCalendarStep('checkOut'); } }}>
            <span>Check-out</span>
            <strong>{checkOut || 'Select a date'}</strong>
          </div>
          <div className="pd-sticky-sep" />
          <div className="pd-sticky-field pd-sticky-guests" style={{ position: 'relative' }}>
            <span>Guests</span>
            <div
              onClick={() => setGuestsOpen((o) => !o)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontWeight: 700, color: '#112a3d', fontSize: '0.95rem', cursor: 'pointer' }}
            >
              {numGuests} guest{numGuests !== 1 ? 's' : ''}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.45, flexShrink: 0, transform: guestsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}><polyline points="6 9 12 15 18 9" /></svg>
            </div>
            {guestsOpen && (
              <>
                <div onClick={() => setGuestsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 210 }} />
                <div style={{ position: 'absolute', bottom: 'calc(100% + 12px)', left: 0, minWidth: 150, maxHeight: 230, overflowY: 'auto', background: '#fff', borderRadius: 14, boxShadow: '0 10px 36px rgba(17,42,61,0.20)', border: '1px solid #e8e0d4', zIndex: 211, padding: 6 }}>
                  {Array.from({ length: property.maxGuests || 1 }, (_, i) => i + 1).map((n) => {
                    const active = n === numGuests;
                    return (
                      <button key={n} type="button"
                        onClick={() => { setNumGuests(n); setGuestsOpen(false); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: active ? 800 : 600, color: active ? '#f6f3eb' : '#112a3d', background: active ? '#112a3d' : 'transparent', transition: 'background 0.12s' }}
                        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#f5f2ec'; }}
                        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {n} guest{n !== 1 ? 's' : ''}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <div className="pd-sticky-sep" />
          <div className="pd-sticky-field">
            <span>Price / Night</span>
            <strong>
              {hasDiscount && <s style={{ color: '#bbb', fontWeight: 400, fontSize: '0.75rem', marginRight: 4 }}>EGP {basePPN.toLocaleString()}</s>}
              EGP {effectivePPN.toLocaleString('en', { maximumFractionDigits: 0 })}
            </strong>
          </div>
          <button className="pd-sticky-book-btn" onClick={handleBookNow}>Book now</button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
