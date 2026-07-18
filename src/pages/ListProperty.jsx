import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertiesAPI } from '../services/api';
import './ListProperty.css';

const CLOUDINARY_CLOUD_NAME = 'dzpswgjsm';
const CLOUDINARY_UPLOAD_PRESET = 'homys_unsigned';

// Google Maps Places API (New) key (browser/HTTP-referrer restricted) — gives
// Google-quality POI/place names (e.g. "Fouka Bay"). Falls back to OSM/Nominatim
// if unset. Requires "Places API (New)" enabled (+ "Geocoding API" for reverse).
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

const PRESET_RULES = [
  { id: 'no_pets',         label: 'No pets allowed' },
  { id: 'no_smoking',      label: 'No smoking' },
  { id: 'no_parties',      label: 'No parties or events' },
  { id: 'no_unregistered', label: 'No unregistered guests' },
  { id: 'quiet_hours',     label: 'Quiet hours after 11 PM' },
  { id: 'no_children',     label: 'Not suitable for children' },
  { id: 'no_mixed',        label: 'No mixed groups' },
  { id: 'check_in_time',   label: 'Check-in 3:00 PM' },
  { id: 'checkout_time',   label: 'Check-out 12:00 PM' },
];

const AMENITIES_LIST = [
  'WiFi','Air Conditioning','Heating','Washer','Dryer','Dishwasher',
  'Coffee Machine','Microwave','Refrigerator','Oven','TV','Balcony',
  'Private Pool','Gym Access','Parking','Security System','Elevator',
  'Baby Crib','Iron','Workspace','Seating Area','Penthouse',
];

const ListProperty = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const sessionTokenRef = useRef(null);     // Mapbox Search Box session token
  const searchDebounceRef = useRef(null);   // debounce timer for live search

  const [formData, setFormData] = useState({
    projectName: '', title: '', propertyType: 'apartment',
    propertyTypeOther: '', bedrooms: 1, bathrooms: 1, sqft: '',
    pricePerNight: '', isFurnished: false, locationName: '',
    latitude: '', longitude: '', maxGuests: 2,
    viewType: '', viewTypeOther: '',
    offersHousekeeping: false, offersBeachAccess: false, serviceFeePercent: 10,
  });

  const [bullets, setBullets] = useState(['']);
  const [selectedRules, setSelectedRules] = useState([]);
  const [customRule, setCustomRule] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [furnished, setFurnished] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);  // track which fields have errors
  const [success, setSuccess] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // ── Map init ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css'; link.rel = 'stylesheet';
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
    loadLeaflet().then((L) => {
      if (mapRef.current && !mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView([26.8, 30.8], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 }).addTo(map);
        map.on('click', (e) => { setPin(L, map, e.latlng.lat, e.latlng.lng); reverseGeocode(e.latlng.lat, e.latlng.lng); });
        mapInstanceRef.current = map;
        setTimeout(() => map.invalidateSize(), 300);
      }
    }).catch(() => {
      if (mapRef.current) mapRef.current.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#112a3d;opacity:0.6;padding:20px;text-align:center"><p>Map unavailable. Enter coordinates manually.</p></div>';
    });
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  const setPin = (L, map, lat, lng) => {
    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
    else {
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

  // One session token groups autocomplete keystrokes + the final Place Details
  // call into a single billed Google session (cheaper, recommended).
  const getSessionToken = () => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = (window.crypto?.randomUUID?.() || `s-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    }
    return sessionTokenRef.current;
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      if (GOOGLE_MAPS_KEY) {
        // Google Geocoding API (requires "Geocoding API" enabled on the key)
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=en&key=${GOOGLE_MAPS_KEY}`);
        const data = await res.json();
        const name = data.results?.[0]?.formatted_address;
        if (name) { setFormData((prev) => ({ ...prev, locationName: name })); return; }
      }
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`);
      const data = await res.json();
      if (data.display_name) setFormData((prev) => ({ ...prev, locationName: data.display_name }));
    } catch { /* silent */ }
  };

  const handlePinCurrentLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported.'); return; }
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

  const handleLocationSearch = async (qOverride) => {
    // qOverride may be a string (live search) or an event (button click) — guard it.
    const q = (typeof qOverride === 'string' ? qOverride : searchQuery).trim();
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      if (GOOGLE_MAPS_KEY) {
        // Google Places API (New) — Autocomplete. Browser-callable (CORS-enabled).
        const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': GOOGLE_MAPS_KEY },
          body: JSON.stringify({
            input: q,
            includedRegionCodes: ['eg'],
            languageCode: 'en',
            sessionToken: getSessionToken(),
          }),
        });
        const data = await res.json();
        setSearchResults((data.suggestions || [])
          .filter((s) => s.placePrediction)
          .map((s) => {
            const p = s.placePrediction;
            const main = p.structuredFormat?.mainText?.text || p.text?.text || '';
            const secondary = p.structuredFormat?.secondaryText?.text || '';
            return {
              place_id: p.placeId,
              display_name: secondary ? `${main} — ${secondary}` : (p.text?.text || main),
            };
          }));
      } else {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&accept-language=en&countrycodes=eg`);
        setSearchResults(await res.json() || []);
      }
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  const handleSelectSearchResult = async (result) => {
    // OSM fallback path already carries coordinates
    if (result.lat && result.lon) {
      const lat = parseFloat(result.lat); const lng = parseFloat(result.lon);
      if (window.L && mapInstanceRef.current) setPin(window.L, mapInstanceRef.current, lat, lng);
      setFormData((prev) => ({ ...prev, locationName: result.display_name }));
      setSearchQuery(result.display_name); setSearchResults([]);
      return;
    }
    // Google Places: a Place Details call resolves the coordinates
    if (!result.place_id || !GOOGLE_MAPS_KEY) return;
    try {
      const res = await fetch(`https://places.googleapis.com/v1/places/${result.place_id}?sessionToken=${getSessionToken()}&languageCode=en`, {
        headers: { 'X-Goog-Api-Key': GOOGLE_MAPS_KEY, 'X-Goog-FieldMask': 'location,formattedAddress,displayName' },
      });
      const data = await res.json();
      if (data.location) {
        const lat = data.location.latitude; const lng = data.location.longitude;
        const fullName = data.formattedAddress
          ? (data.displayName?.text ? `${data.displayName.text} — ${data.formattedAddress}` : data.formattedAddress)
          : (data.displayName?.text || result.display_name);
        if (window.L && mapInstanceRef.current) setPin(window.L, mapInstanceRef.current, lat, lng);
        setFormData((prev) => ({ ...prev, locationName: fullName }));
        setSearchQuery(fullName);
      }
    } catch { /* silent */ }
    finally {
      setSearchResults([]);
      sessionTokenRef.current = null; // end the session after a completed selection
    }
  };

  const handleBulletChange = (index, value) => setBullets((prev) => prev.map((b, i) => i === index ? value : b));
  const addBullet = () => setBullets((prev) => [...prev, '']);
  const removeBullet = (index) => { if (bullets.length === 1) { setBullets(['']); return; } setBullets((prev) => prev.filter((_, i) => i !== index)); };
  const handleBulletKeyDown = (e, index) => {
    if (e.key === 'Enter') { e.preventDefault(); addBullet(); setTimeout(() => document.getElementById(`bullet-${index + 1}`)?.focus(), 50); }
    if (e.key === 'Backspace' && bullets[index] === '' && bullets.length > 1) { e.preventDefault(); removeBullet(index); setTimeout(() => document.getElementById(`bullet-${index - 1}`)?.focus(), 50); }
  };

  const toggleRule = (label) => setSelectedRules((prev) => prev.includes(label) ? prev.filter((r) => r !== label) : [...prev, label]);
  const addCustomRule = () => { const t = customRule.trim(); if (!t || selectedRules.includes(t)) return; setSelectedRules((prev) => [...prev, t]); setCustomRule(''); };
  const removeRule = (rule) => setSelectedRules((prev) => prev.filter((r) => r !== rule));

  const toggleAmenity = (a) => setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  const addCustomAmenity = () => { const t = customAmenity.trim(); if (!t || selectedAmenities.includes(t)) return; setSelectedAmenities((prev) => [...prev, t]); setCustomAmenity(''); };
  const removeAmenity = (a) => setSelectedAmenities((prev) => prev.filter((x) => x !== a));

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
    // Clear this field's error highlight as soon as the user edits it
    setFieldErrors((prev) => (prev.includes(name) ? prev.filter((f) => f !== name) : prev));
  };

  // Returns the id + red-border style for any field group, so error highlighting
  // works uniformly across EVERY field (not just a hand-picked few).
  const groupProps = (name) => ({
    id: `field-${name}`,
    style: fieldErrors.includes(name)
      ? { border: '2px solid #ef4444', borderRadius: 12, padding: 12 }
      : undefined,
  });

  const handleImageChange = (e) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
  };
  const removeImage = (index) => { URL.revokeObjectURL(previewUrls[index]); setSelectedFiles((prev) => prev.filter((_, i) => i !== index)); setPreviewUrls((prev) => prev.filter((_, i) => i !== index)); };

  const uploadToCloudinary = async (file) => {
    const fd = new FormData();
    fd.append('file', file); fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); fd.append('folder', 'homys/properties');
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Failed to upload image');
    return (await res.json()).secure_url;
  };

  const essentials = ['Pharmacy','Supermarket','Hospital','Beach Access','Gym','Restaurant','Shopping Mall','ATM / Bank','Public Transport','Cinema','Park','Security Hub'];
  const handleNearbyChange = (item) => setNearby((prev) => prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!formData.title.trim()) { setError('Please enter a property title.'); return; }
    if (!formData.pricePerNight) { setError('Please enter a price per night.'); return; }
    if (!formData.latitude || !formData.longitude) { setError('Please set your property location on the map.'); return; }
    if (formData.propertyType === 'other' && !formData.propertyTypeOther.trim()) { setError('Please specify the property type.'); return; }
    if (formData.viewType === 'other' && !formData.viewTypeOther.trim()) { setError('Please specify the view type.'); return; }
    if (!isAuthenticated) { setError('You must be logged in to list a property.'); setTimeout(() => navigate('/login'), 2000); return; }

    setSubmitting(true);
    setFieldErrors([]);  // clear previous field errors
    try {
      let imageUrls = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadProgress(`Uploading images (${i + 1}/${selectedFiles.length})…`);
        imageUrls.push(await uploadToCloudinary(selectedFiles[i]));
      }
      setUploadProgress('');
      const description = bullets.filter((b) => b.trim()).join('\n');
      const payload = {
        ...formData,
        isFurnished: furnished === 'yes',
        description, houseRules: selectedRules,
        amenities: selectedAmenities,
        nearbyEssentials: nearby, features: nearby,
        imageUrls, heroImageIndex: 0,
      };
      await propertiesAPI.create(payload);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const errMsg = err.message || 'Failed to submit property. Please try again.';
      setError(errMsg);
      // Extract field-level errors for highlighting
      const fields = (err.fieldErrors || []).map((e) => e.field).filter(Boolean);
      setFieldErrors(fields);
      setUploadProgress('');
      // Scroll to the first errored field, or to the error banner
      if (fields.length > 0) {
        const firstField = document.getElementById(`field-${fields[0]}`);
        if (firstField) { firstField.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally { setSubmitting(false); }
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
              <div className="lp-group" {...groupProps('title')}>
                <label className="encode">Property Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Luxury Sea-View Apartment" className="encode" required />
              </div>
              <div className="lp-group" {...groupProps('projectName')}>
                <label className="encode">Project Name</label>
                <input type="text" name="projectName" value={formData.projectName} onChange={handleInputChange} placeholder="e.g., Mivida" className="encode" />
              </div>

              {/* Property Type + custom "Other" */}
              <div className="lp-group" {...groupProps('propertyType')}>
                <label className="encode">Property Type</label>
                <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="encode">
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="chalet">Chalet</option>
                  <option value="studio">Studio</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {formData.propertyType === 'other' && (
                <div className="lp-group" {...groupProps('propertyTypeOther')}>
                  <label className="encode">Specify Property Type *</label>
                  <input type="text" name="propertyTypeOther" value={formData.propertyTypeOther} onChange={handleInputChange} placeholder="e.g., Penthouse, Townhouse…" className="encode" />
                </div>
              )}

              {/* View Type + custom "Other" */}
              <div className="lp-group" {...groupProps('viewType')}>
                <label className="encode">View Type</label>
                <select name="viewType" value={formData.viewType} onChange={handleInputChange} className="encode">
                  <option value="">No view specified</option>
                  <option value="sea">Sea</option>
                  <option value="pool">Pool</option>
                  <option value="garden">Garden</option>
                  <option value="city">City</option>
                  <option value="lagoon">Lagoon</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {formData.viewType === 'other' && (
                <div className="lp-group" {...groupProps('viewTypeOther')}>
                  <label className="encode">Specify View Type *</label>
                  <input type="text" name="viewTypeOther" value={formData.viewTypeOther} onChange={handleInputChange} placeholder="e.g., Mountain, Desert, Canal…" className="encode" />
                </div>
              )}

              <div className="lp-group" {...groupProps('bedrooms')}>
                <label className="encode">Bedrooms</label>
                <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} min="0" className="encode" />
              </div>
              <div className="lp-group" {...groupProps('bathrooms')}>
                <label className="encode">Bathrooms</label>
                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} min="0" className="encode" />
              </div>
              <div className="lp-group" {...groupProps('maxGuests')}>
                <label className="encode">Max Guests</label>
                <input type="number" name="maxGuests" value={formData.maxGuests} onChange={handleInputChange} min="1" className="encode" />
              </div>
              <div className="lp-group" {...groupProps('sqft')}>
                <label className="encode">Square Footage (sqft)</label>
                <input type="number" name="sqft" value={formData.sqft} onChange={handleInputChange} placeholder="e.g., 1200" className="encode" />
              </div>
              <div className="lp-group" {...groupProps('pricePerNight')}>
                <label className="encode">Price per Night (EGP) *</label>
                <input type="text" name="pricePerNight" value={formData.pricePerNight} onChange={handleInputChange} placeholder="e.g., 2500" className="encode" required />
              </div>
              <div className="lp-group">
                <label className="encode">Furnished?</label>
                <div className="lp-pill-container">
                  <button type="button" className={`lp-pill encode ${furnished === 'yes' ? 'active' : ''}`} onClick={() => setFurnished('yes')}>Yes</button>
                  <button type="button" className={`lp-pill encode ${furnished === 'no' ? 'active' : ''}`} onClick={() => setFurnished('no')}>No</button>
                </div>
              </div>
            </div>

            {/* Bullet description */}
            <div className="lp-group full" id="field-description" style={{ marginTop: 40, ...(fieldErrors.includes('description') ? { border: '2px solid #ef4444', borderRadius: 12, padding: 12 } : {}) }}>
              <label className="encode" style={{ marginBottom: 8, display: 'block' }}>
                Description <span style={{ opacity: 0.5, fontWeight: 400 }}>(one feature per line)</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bullets.map((bullet, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#c4a369', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0 }}>•</span>
                    <input id={`bullet-${index}`} type="text" value={bullet}
                      onChange={(e) => handleBulletChange(index, e.target.value)}
                      onKeyDown={(e) => handleBulletKeyDown(e, index)}
                      placeholder={index === 0 ? 'e.g., Stunning sea view from the balcony' : 'Add another feature…'}
                      className="encode" style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e0d9ce', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit' }} />
                    <button type="button" onClick={() => removeBullet(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', flexShrink: 0, padding: 4 }}>
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

          {/* ── Amenities ── */}
          <div className="form-section">
            <h2 className="libre">Amenities</h2>
            <p className="encode section-desc">Select all amenities available at your property.</p>
            <div className="essentials-grid">
              {AMENITIES_LIST.map((item) => (
                <label key={item} className="custom-checkbox-label encode">
                  <input type="checkbox" checked={selectedAmenities.includes(item)} onChange={() => toggleAmenity(item)} />
                  <span className="box-checkmark" />
                  {item}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              <input type="text" value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomAmenity(); } }}
                placeholder="Add a custom amenity…" className="encode"
                style={{ flex: 1, minWidth: 200, padding: '10px 14px', border: '1.5px solid #e0d9ce', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit' }} />
              <button type="button" onClick={addCustomAmenity}
                style={{ padding: '10px 20px', background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}>
                Add
              </button>
            </div>
            {selectedAmenities.filter((a) => !AMENITIES_LIST.includes(a)).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {selectedAmenities.filter((a) => !AMENITIES_LIST.includes(a)).map((a) => (
                  <span key={a} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#112a3d', color: '#f6f3eb', padding: '6px 14px', borderRadius: 50, fontSize: '0.8rem', fontWeight: 600 }}>
                    {a}
                    <button type="button" onClick={() => removeAmenity(a)} style={{ background: 'none', border: 'none', color: '#f6f3eb', cursor: 'pointer', padding: 0, opacity: 0.7 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── House Rules ── */}
          <div className="form-section">
            <h2 className="libre">House Rules</h2>
            <p className="encode section-desc">Select the rules that apply to your property.</p>
            <div className="essentials-grid">
              {PRESET_RULES.map((rule) => (
                <label key={rule.id} className="custom-checkbox-label encode">
                  <input type="checkbox" checked={selectedRules.includes(rule.label)} onChange={() => toggleRule(rule.label)} />
                  <span className="box-checkmark" />
                  {rule.label}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              <input type="text" value={customRule} onChange={(e) => setCustomRule(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomRule(); } }}
                placeholder="Add a custom rule…" className="encode"
                style={{ flex: 1, minWidth: 200, padding: '10px 14px', border: '1.5px solid #e0d9ce', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit' }} />
              <button type="button" onClick={addCustomRule}
                style={{ padding: '10px 20px', background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}>
                Add
              </button>
            </div>
            {selectedRules.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                {selectedRules.map((rule) => (
                  <span key={rule} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#112a3d', color: '#f6f3eb', padding: '6px 14px', borderRadius: 50, fontSize: '0.8rem', fontWeight: 600 }}>
                    {rule}
                    <button type="button" onClick={() => removeRule(rule)} style={{ background: 'none', border: 'none', color: '#f6f3eb', cursor: 'pointer', padding: 0, opacity: 0.7 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Extra Fees ── */}
          <div className="form-section">
            <h2 className="libre">Extra Fees & Service Fee</h2>
            <p className="encode section-desc">A refundable insurance fee equal to one night is automatically added to every booking. Tick any extra fees this property charges — they're mandatory and added to the guest's total.</p>
            <div className="essentials-grid">
              <label className="custom-checkbox-label encode">
                <input type="checkbox" checked={formData.offersHousekeeping} onChange={(e) => setFormData((p) => ({ ...p, offersHousekeeping: e.target.checked }))} />
                <span className="box-checkmark" />
                Housekeeping — EGP 2,000 / stay
              </label>
              <label className="custom-checkbox-label encode">
                <input type="checkbox" checked={formData.offersBeachAccess} onChange={(e) => setFormData((p) => ({ ...p, offersBeachAccess: e.target.checked }))} />
                <span className="box-checkmark" />
                Beach Access — EGP 2,000 / week per guest
              </label>
            </div>
            <div className="lp-group" style={{ marginTop: 24, maxWidth: 280 }}>
              <label className="encode">Service Fee (%)</label>
              <input type="number" name="serviceFeePercent" min="0" max="100" step="0.5" value={formData.serviceFeePercent} onChange={handleInputChange} className="encode" />
            </div>
          </div>

          {/* ── Set Location ── */}
          <div className="form-section">
            <h2 className="libre">Set Location</h2>
            <p className="encode section-desc">Search for your property location in Egypt, click on the map, or use current location.</p>
            <div className="map-container-box">
              <div className="map-search-wrapper">
                <div className="map-search-input-row">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <input type="text" className="encode map-search-input" placeholder="Search in Egypt (e.g. Fouka Bay, Mountain View, Gouna)…"
                    value={searchQuery}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSearchQuery(v);
                      clearTimeout(searchDebounceRef.current);
                      if (v.trim().length < 2) { setSearchResults([]); return; }
                      searchDebounceRef.current = setTimeout(() => handleLocationSearch(v), 300);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(searchDebounceRef.current); handleLocationSearch(); } }} autoComplete="off" />
                  <button type="button" className="map-search-btn encode" onClick={() => handleLocationSearch()} disabled={searching || searchQuery.trim().length < 2}>
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
              </div>
              <div ref={mapRef} id="leaflet-map" style={{ width: '100%', height: '400px', border: '2px solid #081621', borderRadius: 4 }} />
              <div className="map-actions-row">
                <button type="button" className="pin-loc-btn encode" onClick={handlePinCurrentLocation} disabled={locating}>
                  {locating ? <><span className="loc-spinner" /> Locating…</> : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /></svg> Pin Current Location</>}
                </button>
                {formData.latitude && <span className="encode coords-display">📍 {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}</span>}
              </div>
              {formData.locationName && <div className="location-name-display encode"><strong>Location:</strong> {formData.locationName}</div>}
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
          <div className="form-section" id="field-imageUrls" style={fieldErrors.includes('imageUrls') ? { border: '2px solid #ef4444', borderRadius: 12, padding: 12 } : undefined}>
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
                    {index === 0 && <span style={{ position: 'absolute', bottom: 8, left: 8, background: '#112a3d', color: '#f6f3eb', padding: '3px 10px', borderRadius: 12, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Cover</span>}
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
