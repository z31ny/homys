import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingsAPI } from '../services/api';
import './BookingDocs.css';

const CLOUDINARY_CLOUD_NAME = 'dzpswgjsm';
const CLOUDINARY_UPLOAD_PRESET = 'homys_unsigned';

const uploadToCloudinary = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  fd.append('folder', 'homys/booking-docs');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  return (await res.json()).secure_url;
};

const DocUploadSlot = ({ label, description, required, file, preview, onFileChange, onRemove }) => (
  <div style={{ background: '#f9f6f1', border: `1.5px solid ${file ? '#4caf82' : '#e8e0d4'}`, borderRadius: 14, padding: '20px', transition: 'border-color 0.2s' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div>
        <p style={{ fontWeight: 700, color: '#112a3d', margin: '0 0 3px', fontSize: '0.9rem' }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </p>
        <p style={{ fontSize: '0.78rem', color: '#8b8b8b', margin: 0 }}>{description}</p>
      </div>
      {file && (
        <span style={{ fontSize: '0.75rem', background: '#e8f5e9', color: '#2e7d32', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>Uploaded</span>
      )}
    </div>

    {preview ? (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img src={preview} alt={label} style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 8, border: '2px solid #4caf82' }} />
        <button onClick={onRemove}
          style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ✕
        </button>
      </div>
    ) : (
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px dashed #c4a369', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#112a3d', fontFamily: 'inherit' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
        Upload Photo / Scan
        <input type="file" accept="image/*,.pdf" onChange={onFileChange} style={{ display: 'none' }} />
      </label>
    )}
  </div>
);

const BookingDocs = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Fallback to localStorage when navigating back from Paymob (router state is lost)
  const bookingId = state?.bookingId
    || localStorage.getItem('homys_pending_booking_id')
    || null;
  const propertyTitle = state?.title
    || localStorage.getItem('homys_pending_booking_title')
    || 'your booking';
  const numGuests = state?.numGuests
    || parseInt(localStorage.getItem('homys_pending_num_guests') || '1', 10)
    || 1;

  // Clear localStorage entries once we've consumed them
  React.useEffect(() => {
    if (bookingId) {
      localStorage.removeItem('homys_pending_booking_id');
      localStorage.removeItem('homys_pending_booking_title');
      localStorage.removeItem('homys_pending_num_guests');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const extraGuestCount = Math.max(0, numGuests - 1);

  const [isCouple, setIsCouple] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Primary guest ID
  const [primaryId, setPrimaryId] = useState({ file: null, preview: null, url: null });

  // Extra guest IDs — one slot per additional guest
  const [guestIds, setGuestIds] = useState(
    () => Array.from({ length: Math.max(extraGuestCount, 0) }, () => ({ file: null, preview: null, url: null }))
  );

  // Marriage / relationship certificate
  const [certDoc, setCertDoc] = useState({ file: null, preview: null, url: null });

  const handlePrimaryFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setPrimaryId({ file, preview, url: null });
  };

  const removePrimary = () => {
    if (primaryId.preview) URL.revokeObjectURL(primaryId.preview);
    setPrimaryId({ file: null, preview: null, url: null });
  };

  const handleGuestFile = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setGuestIds((prev) => prev.map((g, i) => i === index ? { file, preview, url: null } : g));
  };

  const removeGuest = (index) => {
    setGuestIds((prev) => prev.map((g, i) => {
      if (i !== index) return g;
      if (g.preview) URL.revokeObjectURL(g.preview);
      return { file: null, preview: null, url: null };
    }));
  };

  const handleCertFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setCertDoc({ file, preview, url: null });
  };

  const removeCert = () => {
    if (certDoc.preview) URL.revokeObjectURL(certDoc.preview);
    setCertDoc({ file: null, preview: null, url: null });
  };

  if (!bookingId) {
    return (
      <div style={{ padding: '120px 40px', textAlign: 'center' }}>
        <h2>No booking found</h2>
        <p style={{ opacity: 0.6, marginBottom: 8 }}>Please go back and complete your booking first.</p>
        <p style={{ opacity: 0.5, fontSize: '0.88rem', marginBottom: 28 }}>
          If you've already paid, you can find the "Upload Documents" button on your booking in My Bookings.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/profile')} style={{ padding: '12px 28px', background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 50, fontWeight: 700, cursor: 'pointer' }}>My Bookings</button>
          <button onClick={() => navigate('/stays')} style={{ padding: '12px 28px', background: 'transparent', color: '#112a3d', border: '2px solid #112a3d', borderRadius: 50, fontWeight: 700, cursor: 'pointer' }}>Browse Stays</button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 40, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, background: '#e8f5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="libre" style={{ color: '#112a3d', marginBottom: 10 }}>Documents Submitted!</h2>
        <p className="encode" style={{ color: '#8b8b8b', maxWidth: 420, lineHeight: 1.7 }}>
          Your identity documents are now under review. You'll receive a confirmation once an admin approves your booking. This usually takes up to a few hours.
        </p>
        <button onClick={() => navigate('/profile')}
          style={{ marginTop: 32, padding: '12px 28px', background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 50, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}>
          View My Bookings
        </button>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError('');
    if (!primaryId.file) { setError('Please upload your National ID or Passport.'); return; }

    setSubmitting(true);
    try {
      const uploadedDocs = [];

      // Upload primary ID
      const primaryUrl = await uploadToCloudinary(primaryId.file);
      uploadedDocs.push({ type: 'national_id', owner: 'primary', label: 'Primary Guest ID', url: primaryUrl });

      // Upload each extra guest ID
      for (let i = 0; i < guestIds.length; i++) {
        if (guestIds[i].file) {
          const url = await uploadToCloudinary(guestIds[i].file);
          uploadedDocs.push({ type: 'national_id', owner: `guest_${i + 2}`, label: `Guest ${i + 2} ID`, url });
        }
      }

      // Upload certificate if couple
      if (isCouple && certDoc.file) {
        const certUrl = await uploadToCloudinary(certDoc.file);
        uploadedDocs.push({ type: 'marriage_cert', owner: 'primary', label: 'Marriage Certificate', url: certUrl });
      }

      await bookingsAPI.submitDocs(bookingId, { docs: uploadedDocs, isCouple });
      setDone(true);
    } catch (err) {
      setError(err.message || 'Failed to submit documents. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f6f3eb', padding: '40px 20px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#112a3d', fontWeight: 700, marginBottom: 32, fontSize: '0.9rem' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, background: '#f0ece4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#112a3d" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <h1 className="libre" style={{ color: '#112a3d', marginBottom: 8 }}>Identity Verification</h1>
          <p className="encode" style={{ color: '#8b8b8b', lineHeight: 1.7 }}>
            Your deposit for <strong style={{ color: '#112a3d' }}>{propertyTitle}</strong> has been received.
            Please upload the required documents below so we can confirm your booking.
          </p>
        </div>

        {/* Info banner */}
        <div style={{ background: '#e8f4fd', border: '1px solid #b3d7f2', borderRadius: 12, padding: '14px 18px', marginBottom: 28, fontSize: '0.85rem', color: '#1565c0', lineHeight: 1.6 }}>
          <strong>Why we need this:</strong> Per Egyptian property regulations, all guests must provide valid identity documents before check-in. Your documents are reviewed only by Homys staff and are kept confidential.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
          {/* Primary guest ID */}
          <DocUploadSlot
            label="Your National ID or Passport"
            description="Upload a clear photo of your Egyptian National ID (front side) or passport photo page."
            required
            file={primaryId.file}
            preview={primaryId.preview}
            onFileChange={handlePrimaryFile}
            onRemove={removePrimary}
          />

          {/* Dynamic extra guest ID slots */}
          {guestIds.map((guest, i) => (
            <DocUploadSlot
              key={i}
              label={`Guest ${i + 2} — National ID or Passport`}
              description={`Upload a clear photo of Guest ${i + 2}'s Egyptian National ID (front side) or passport photo page.`}
              required={false}
              file={guest.file}
              preview={guest.preview}
              onFileChange={(e) => handleGuestFile(i, e)}
              onRemove={() => removeGuest(i)}
            />
          ))}

          {/* Couple toggle */}
          <div style={{ background: '#f9f6f1', border: '1.5px solid #e8e0d4', borderRadius: 14, padding: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
              <div style={{ position: 'relative', width: 48, height: 26, background: isCouple ? '#112a3d' : '#d4cfc7', borderRadius: 13, transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 3, left: isCouple ? 25 : 3, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
                <input type="checkbox" checked={isCouple} onChange={(e) => setIsCouple(e.target.checked)} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: '#112a3d', margin: '0 0 2px', fontSize: '0.9rem' }}>We are traveling as a couple</p>
                <p style={{ fontSize: '0.78rem', color: '#8b8b8b', margin: 0 }}>If selected, you may be asked to provide a marriage certificate below.</p>
              </div>
            </label>
          </div>

          {/* Marriage certificate — shown if couple */}
          {isCouple && (
            <DocUploadSlot
              label="Marriage Certificate"
              description="Upload your marriage certificate (optional but may be required by certain properties)."
              required={false}
              file={certDoc.file}
              preview={certDoc.preview}
              onFileChange={handleCertFile}
              onRemove={removeCert}
            />
          )}
        </div>

        {error && (
          <div style={{ background: '#fde8e8', border: '1px solid #f5c6c6', borderRadius: 10, padding: '12px 16px', color: '#c62828', fontSize: '0.88rem', fontWeight: 600, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%', padding: '16px', background: '#112a3d', color: '#f6f3eb', border: 'none',
            borderRadius: 50, fontWeight: 800, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1, fontFamily: 'inherit',
          }}
        >
          {submitting ? 'Uploading & Submitting…' : 'Submit Documents for Review'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#8b8b8b', marginTop: 14 }}>
          Your booking will be confirmed once an admin reviews your documents.
        </p>
      </div>
    </div>
  );
};

export default BookingDocs;
