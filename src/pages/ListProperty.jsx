import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertiesAPI } from '../services/api';
import './ListProperty.css';

const CLOUDINARY_CLOUD_NAME = 'dzpswgjsm';
const CLOUDINARY_UPLOAD_PRESET = 'homys_unsigned';

// Predefined house rules the owner can toggle on
const PRESET_RULES = [
  { id: 'no_pets',       label: '🐾 No pets allowed' },
  { id: 'no_smoking',    label: '🚬 No smoking' },
  { id: 'no_parties',    label: '🎉 No parties or events' },
  { id: 'no_unregistered', label: '👤 No unregistered guests' },
  { id: 'quiet_hours',   label: '🌙 Quiet hours after 11 PM' },
  { id: 'no_children',   label: '👶 Not suitable for children' },
  { id: 'check_in_time', label: '🕐 Check-in after 2 PM' },
  { id: 'checkout_time', label: '🕑 Checkout before 12 PM' },
];

const ListProperty = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [formData, setFormData] = useState({
    projectName: '',
    title: '',
    propertyType: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    sqft: '',
    pricePerNight: '',
    isFurnished: false,
    locationName: '',
    latitude: '',
    longitude: '',
    maxGuests: 2,
    viewType: '',
  });

  // Bullet-point description: array of strings, one per bullet
  const [bullets, setBullets] = useState(['']);

  // House rules
  const [selectedRules, setSelectedRules] = useState([]);
  const [customRule, setCustomRule] = useState('');

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [furnished, setFurnished] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // ── Map init ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const loadLeaflet = () => new Promise((resolve, reject) => {
      if (window.L) { resolve(window.L); return; }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve(window.L);
      script.onerror = () => reject(new Error('Failed to load Leaflet'));
      document.head.appendChild(script);
    });

    loadLeaflet()
      .then((L) => {
        if (mapRef.current && !mapInstanceRef.current) {
          // Default view: Egypt
          const map = L.map(mapRef.current).setView([26.8, 30.8], 6);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map);
          map.on('click', (e) => {
            setPin(L, map, e.latlng.lat, e.latlng.lng);
            reverseGeocode(e.latlng.lat, e.latlng.lng);
          });
          mapInstanceRef.current = map;
          setTimeout(() => map.invalidateSize(), 300);
        }
      })
      .catch(() => {
        if (mapRef.current) {
          mapRef.current.innerHTML =
            '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#112a3d;opacity:0.6;text-align:center;padding:20px"><p>Map could not be loaded. Enter coordinates manually or try refreshing.</p></div>';
        }
      });

    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPin = (L, map, lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setFormData((prev) => ({ ...prev, latitude: pos.lat.toFixed(6), longitude: pos.lng.toFixed(6) }));
        reverseGeocode(pos.lat, pos.lng);
      });
    }
    map.setView([lat, lng], 15);
    setFormData((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`
      );
      const data = await res.json();
      if (data.display_name) setFormData((prev) => ({ ...prev, locationName: data.display_name }));
    } catch { /* silent */ }
  };

  const handlePinCurrentLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported by your browser.'); return; }
    setLocating(true); setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const L = window.L; const map = mapInstanceRef.current;
        if (L && map) { setPin(L, map, coords.latitude, coords.longitude); reverseGeocode(coords.latitude, coords.longitude); }
        setLocating(false);
      },
      (err) => { setError(`Location error: ${err.message}`); setLocating(false); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // ── Egypt-only location search ────────────────────────────────────────
  const handleLocationSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    setSearching(true); setSearchResults([]);
    try {
      // countrycodes=eg restricts Nominatim results to Egypt only
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=6&accept-language=en&countrycodes=eg`
      );
      const data = await res.json();
      setSearchResults(data || []);
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const L = window.L; const map = mapInstanceRef.current;
    if (L && map) setPin(L, map, lat, lng);
    setFormData((prev) => ({ ...prev, locationName: result.display_name }));
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  // ── Bullet description helpers ────────────────────────────────────────
  const handleBulletChange = (index, value) => {
    setBullets((prev) => prev.map((b, i) => (i === index ? value : b)));
  };
  const addBullet = () => setBullets((prev) => [...prev, '']);
  const removeBullet = (index) => {
    if (bullets.length === 1) { setBullets(['']); return; }
    setBullets((prev) => prev.filter((_, i) => i !== index));
  };
  const handleBulletKeyDown = (e, index) => {
    if (e.key === 'Enter') { e.preventDefault(); addBullet(); setTimeout(() => document.getElementById(`bullet-${index + 1}`)?.focus(), 50); }
    if (e.key === 'Backspace' && bullets[index] === '' && bullets.length > 1) { e.preventDefault(); removeBullet(index); setTimeout(() => document.getElementById(`bullet-${index - 1}`)?.focus(), 50); }
  };

  // ── House rules ───────────────────────────────────────────────────────
  const toggleRule = (ruleLabel) => {
    setSelectedRules((prev) =>
      prev.includes(ruleLabel) ? prev.filter((r) => r !== ruleLabel) : [...prev, ruleLabel]
    );
  };
  const addCustomRule = () => {
    const trimmed = customRule.trim();
    if (!trimmed || selectedRules.includes(trimmed)) return;
    setSelectedRules((prev) => [...prev, trimmed]);
    setCustomRule('');
  };
  const removeRule = (rule) => setSelectedRules((prev) => prev.filter((r) => r !== rule));

  // ── Form ──────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleImageChange = (e) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadToCloudinary = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    fd.append('folder', 'homys/properties');
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Failed to upload image');
    return (await res.json()).secure_url;
  };

  const essentials = ['Pharmacy', 'Supermarket', 'Hospital', 'Beach Access', 'Gym', 'Restaurant', 'Shopping Mall', 'ATM / Bank', 'Public Transport', 'Cinema', 'Park', 'Security Hub'];
  const handleNearbyChange = (item) => setNearby((prev) => prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) { setError('Please enter a property title.'); return; }
    if (!formData.pricePerNight) { setError('Please enter a price per night.'); return; }
    if (!formData.latitude || !formData.longitude) { setError('Please set your property location on the map.'); return; }
    if (!isAuthenticated) { setError('You must be logged in to list a property. Redirecting…'); setTimeout(() => navigate('/login'), 2000); return; }

    setSubmitting(true);
    try {
      let imageUrls = [];
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadProgress(`Uploading images (${i + 1}/${selectedFiles.length})…`);
          imageUrls.push(await uploadToCloudinary(selectedFiles[i]));
        }
        setUploadProgress('');
      }

      // Join bullets into newline-separated string (backend stores as text)
      const description = bullets.filter((b) => b.trim()).join('\n');

      const payload = {
        ...formData,
        isFurnished: furnished === 'yes',
        description,
        houseRules: selectedRules,
        nearbyEssentials: nearby,
        features: nearby,
        imageUrls,
        heroImageIndex: 0,
      };

      await propertiesAPI.create(payload);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Failed to submit property. Please try again.');
      setUploadProgress('');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="list-property-page">
        <div className="lp-container">
          <div className="lp-success-card">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#081621" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            <h1 className="libre">Property Submitted!</h1>
            <p className="encode">Your property has been submitted for review. We'll notify you once it's approved.</p>
            <button className="lp-submit-final encode" style={{ marginTop: 40 }} onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="list-property-page">
      <button className="back-btn-global" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back
      </button>

      <div className="lp-container">
        <header className="lp-header">
          <h1 className="libre">List Your Sanctuary</h1>
          <p className="encode">Join the Homys collection and share your home with global travelers.</p>
        </header>

        {error && (
          <div className="lp-error-banner encode">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            {error}
          </div>
        )}

        <form className="lp-form" onSubmit={handleSubmit}>

          {/* ── Property Details ── */}
          <div className="form-section">
            <h2 className="libre">Property Details</h2>
            <div className="lp-grid">
              <div className="lp-group">
                <label className="encode">Property Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Luxury Sea-View Apartment" className="encode" required />
              </div>
              <div className="lp-group">
                <label className="encode">Project Name</label>
                <input type="text" name="projectName" value={formData.projectName} onChange={handleInputChange} placeholder="e.g., Mivida" className="encode" />
              </div>
              <div className="lp-group">
                <label className="encode">Property Type</label>
                <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="encode">
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="chalet">Chalet</option>
                  <option value="studio">Studio</option>
                </select>
              </div>
              <div className="lp-group">
                <label className="encode">View Type</label>
                <select name="viewType" value={formData.viewType} onChange={handleInputChange} className="encode">
                  <option value="">Select view type</option>
                  <option value="sea">Sea</option>
                  <option value="pool">Pool</option>
                  <option value="garden">Garden</option>
                  <option value="city">City</option>
                </select>
              </div>
              <div className="lp-group">
                <label className="encode">Bedrooms</label>
                <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} min="0" className="encode" />
              </div>
              <div className="lp-group">
                <label className="encode">Bathrooms</label>
                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} min="0" className="encode" />
              </div>
              <div className="lp-group">
                <label className="encode">Max Guests</label>
                <input type="number" name="maxGuests" value={formData.maxGuests} onChange={handleInputChange} min="1" className="encode" />
              </div>
              <div className="lp-group">
                <label className="encode">Square Footage (sqft)</label>
                <input type="number" name="sqft" value={formData.sqft} onChange={handleInputChange} placeholder="e.g., 1200" className="encode" />
              </div>
              <div className="lp-group">
                <label className="encode">Price per Night ($) *</label>
                <input type="text" name="pricePerNight" value={formData.pricePerNight} onChange={handleInputChange} placeholder="e.g., 250" className="encode" required />
              </div>
              <div className="lp-group">
                <label className="encode">Furnished?</label>
                <div className="lp-pill-container">
                  <button type="button" className={`lp-pill encode ${furnished === 'yes' ? 'active' : ''}`} onClick={() => setFurnished('yes')}>Yes</button>
                  <button type="button" className={`lp-pill encode ${furnished === 'no' ? 'active' : ''}`} onClick={() => setFurnished('no')}>No</button>
                </div>
              </div>
            </div>

            {/* ── Bullet-point description ── */}
            <div className="lp-group full" style={{ marginTop: 40 }}>
              <label className="encode" style={{ marginBottom: 8, display: 'block' }}>
                Description <span style={{ opacity: 0.5, fontWeight: 400 }}>(one feature per line — shown as bullet points to guests)</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bullets.map((bullet, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#c4a369', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0, lineHeight: 1 }}>•</span>
                    <input
                      id={`bullet-${index}`}
                      type="text"
                      value={bullet}
                      onChange={(e) => handleBulletChange(index, e.target.value)}
                      onKeyDown={(e) => handleBulletKeyDown(e, index)}
                      placeholder={index === 0 ? 'e.g., Stunning sea view from the balcony' : 'Add another feature…'}
                      className="encode"
                      style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e0d9ce', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit' }}
                    />
                    <button type="button" onClick={() => removeBullet(index)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', flexShrink: 0, padding: 4, display: 'flex', alignItems: 'center', opacity: bullets.length === 1 && !bullet ? 0.3 : 1 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addBullet}
                style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f2ec', border: '1.5px dashed #c4a369', borderRadius: 50, padding: '8px 18px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.82rem', color: '#112a3d' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add bullet point
              </button>
            </div>
          </div>

          {/* ── House Rules ── */}
          <div className="form-section">
            <h2 className="libre">House Rules</h2>
            <p className="encode section-desc">Select the rules that apply to your property. These will be shown to guests before they book.</p>
            <div className="essentials-grid">
              {PRESET_RULES.map((rule) => (
                <label key={rule.id} className="custom-checkbox-label encode">
                  <input type="checkbox" checked={selectedRules.includes(rule.label)} onChange={() => toggleRule(rule.label)} />
                  <span className="box-checkmark"></span>
                  {rule.label}
                </label>
              ))}
            </div>

            {/* Custom rule input */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              <input
                type="text"
                value={customRule}
                onChange={(e) => setCustomRule(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomRule(); } }}
                placeholder="Add a custom rule…"
                className="encode"
                style={{ flex: 1, minWidth: 200, padding: '10px 14px', border: '1.5px solid #e0d9ce', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit' }}
              />
              <button type="button" onClick={addCustomRule}
                style={{ padding: '10px 20px', background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}>
                Add
              </button>
            </div>

            {/* Selected rules preview */}
            {selectedRules.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                {selectedRules.map((rule) => (
                  <span key={rule} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#112a3d', color: '#f6f3eb', padding: '6px 14px', borderRadius: 50, fontSize: '0.8rem', fontWeight: 600 }}>
                    {rule}
                    <button type="button" onClick={() => removeRule(rule)}
                      style={{ background: 'none', border: 'none', color: '#f6f3eb', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Set Location ── */}
          <div className="form-section">
            <h2 className="libre">Set Location</h2>
            <p className="encode section-desc">Search for your property location in Egypt, click on the map, or use current location.</p>
            <div className="map-container-box">
              <div className="map-search-wrapper">
                <div className="map-search-input-row">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <input
                    type="text"
                    className="encode map-search-input"
                    placeholder="Search in Egypt (e.g. Sahel, Gouna, Marassi, Ain Sokhna)…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLocationSearch(); } }}
                    autoComplete="off"
                  />
                  <button type="button" className="map-search-btn encode" onClick={handleLocationSearch} disabled={searching || searchQuery.trim().length < 2}>
                    {searching ? <span className="loc-spinner" /> : 'Search'}
                  </button>
                </div>
                {searchResults.length > 0 && (
                  <div className="map-search-dropdown">
                    {searchResults.map((r, i) => (
                      <div key={i} className="map-search-result encode" onClick={() => handleSelectSearchResult(r)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        <span>{r.display_name}</span>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.length === 0 && searching === false && searchQuery.length > 2 && (
                  <p style={{ padding: '8px 12px', fontSize: '0.82rem', opacity: 0.5, fontFamily: 'inherit' }}>
                    No results found in Egypt. Try a different search term.
                  </p>
                )}
              </div>
              <div ref={mapRef} id="leaflet-map" style={{ width: '100%', height: '400px', border: '2px solid #081621', borderRadius: 4 }} />
              <div className="map-actions-row">
                <button type="button" className="pin-loc-btn encode" onClick={handlePinCurrentLocation} disabled={locating}>
                  {locating ? <><span className="loc-spinner" /> Locating…</> : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /></svg> Pin Current Location</>}
                </button>
                {formData.latitude && (
                  <span className="encode coords-display">📍 {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}</span>
                )}
              </div>
              {formData.locationName && (
                <div className="location-name-display encode"><strong>Location:</strong> {formData.locationName}</div>
              )}
            </div>
          </div>

          {/* ── Nearby Essentials ── */}
          <div className="form-section">
            <h2 className="libre">Nearby Essentials</h2>
            <p className="encode section-desc">Select services available within walking distance.</p>
            <div className="essentials-grid">
              {essentials.map((item) => (
                <label key={item} className="custom-checkbox-label encode">
                  <input type="checkbox" checked={nearby.includes(item)} onChange={() => handleNearbyChange(item)} />
                  <span className="box-checkmark" />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {/* ── Property Images ── */}
          <div className="form-section">
            <h2 className="libre">Property Images</h2>
            <p className="encode section-desc">Upload at least 4 high-quality photos. The first image will be the cover.</p>
            <div className="upload-zone-wrapper">
              <label htmlFor="property-upload" className="image-drop-zone">
                <div className="upload-ui">
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  <span className="encode">Click to select property photos</span>
                </div>
              </label>
              <input id="property-upload" type="file" multiple onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
              <div className="image-preview-flex">
                {previewUrls.map((url, index) => (
                  <div key={index} className="image-preview-card">
                    <img src={url} alt={`Preview ${index}`} />
                    <button type="button" className="remove-img-btn" onClick={() => removeImage(index)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                    {index === 0 && (
                      <span style={{ position: 'absolute', bottom: 8, left: 8, background: '#112a3d', color: '#f6f3eb', padding: '3px 10px', borderRadius: 12, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Cover</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lp-action-footer">
            {uploadProgress && <p className="encode" style={{ textAlign: 'center', color: '#112a3d', fontWeight: 700, marginBottom: 16 }}>{uploadProgress}</p>}
            <button type="submit" className="lp-submit-final encode" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Property For Review'}
            </button>
            <p className="encode terms-hint">By submitting, you agree to our standard quality and safety compliance.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListProperty;
