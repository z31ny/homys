import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertiesAPI } from '../services/api';
import './ListProperty.css';

const CLOUDINARY_CLOUD_NAME = 'dzpswgjsm';
const CLOUDINARY_UPLOAD_PRESET = 'homys_unsigned';

const ListProperty = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Form state — removed bedType and climateInfo
  const [formData, setFormData] = useState({
    projectName: '',
    title: '',
    propertyType: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    sqft: '',
    pricePerNight: '',
    isFurnished: false,
    description: '',
    locationName: '',
    latitude: '',
    longitude: '',
    maxGuests: 2,
    viewType: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]); // Actual File objects
  const [previewUrls, setPreviewUrls] = useState([]); // blob URLs for preview
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
  const searchTimeoutRef = useRef(null);

  // Initialize Leaflet map
  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadLeaflet = () => {
      return new Promise((resolve, reject) => {
        if (window.L) {
          resolve(window.L);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve(window.L);
        script.onerror = () => reject(new Error('Failed to load map library'));
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then((L) => {
      try {
        if (mapRef.current && !mapInstanceRef.current) {
          const map = L.map(mapRef.current).setView([30.044, 31.235], 12);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map);

          // Click on map to set pin
          map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setPin(L, map, lat, lng);
            reverseGeocode(lat, lng);
          });

          mapInstanceRef.current = map;

          // Fix tile rendering issue when map is in a hidden/flexed container
          setTimeout(() => map.invalidateSize(), 300);
        }
      } catch (err) {
        // Show fallback message in map container (edge case 10.6)
        if (mapRef.current) {
          mapRef.current.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#112a3d;opacity:0.6;font-family:\'Encode Sans Expanded\',sans-serif;text-align:center;padding:20px"><p>Map could not be loaded. Please enter coordinates manually or try refreshing the page.</p></div>';
        }
      }
    }).catch(() => {
      // CDN failure fallback (edge case 10.6)
      if (mapRef.current) {
        mapRef.current.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#112a3d;opacity:0.6;font-family:\'Encode Sans Expanded\',sans-serif;text-align:center;padding:20px"><p>Map could not be loaded. You can still enter your location coordinates manually below.</p></div>';
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPin = (L, map, lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setFormData((prev) => ({
          ...prev,
          latitude: pos.lat.toFixed(6),
          longitude: pos.lng.toFixed(6),
        }));
        reverseGeocode(pos.lat, pos.lng);
      });
    }

    map.setView([lat, lng], 16);
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`
      );
      const data = await res.json();
      if (data.display_name) {
        setFormData((prev) => ({ ...prev, locationName: data.display_name }));
      }
    } catch {
      // Silently fail — user can enter location manually
    }
  };

  const handlePinCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const L = window.L;
        const map = mapInstanceRef.current;
        if (L && map) {
          setPin(L, map, latitude, longitude);
          reverseGeocode(latitude, longitude);
        }
        setLocating(false);
      },
      (err) => {
        setError(`Location error: ${err.message}. Please allow location access or pin manually on the map.`);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLocationSearch = (query) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=eg&accept-language=en`
        );
        const data = await res.json();
        setSearchResults(data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const L = window.L;
    const map = mapInstanceRef.current;
    if (L && map) {
      setPin(L, map, lat, lng);
    }
    setFormData((prev) => ({ ...prev, locationName: result.display_name }));
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      // Revoke the old blob URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  /**
   * Upload a single file to Cloudinary using unsigned upload preset.
   */
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'homys/properties');

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!res.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await res.json();
    return data.secure_url;
  };

  const essentials = [
    "Pharmacy", "Supermarket", "Hospital", "Beach Access",
    "Gym", "Restaurant", "Shopping Mall", "ATM / Bank",
    "Public Transport", "Cinema", "Park", "Security Hub"
  ];

  const handleNearbyChange = (item) => {
    setNearby((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.title.trim()) {
      setError('Please enter a property title.');
      return;
    }
    if (!formData.pricePerNight) {
      setError('Please enter a price per night.');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      setError('Please set your property location on the map.');
      return;
    }

    if (!isAuthenticated) {
      setError('You must be logged in to list a property. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setSubmitting(true);

    try {
      // Upload images to Cloudinary
      let imageUrls = [];
      if (selectedFiles.length > 0) {
        setUploadProgress(`Uploading images (0/${selectedFiles.length})...`);
        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadProgress(`Uploading images (${i + 1}/${selectedFiles.length})...`);
          const url = await uploadToCloudinary(selectedFiles[i]);
          imageUrls.push(url);
        }
        setUploadProgress('');
      }

      const payload = {
        ...formData,
        isFurnished: furnished === 'yes',
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
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#081621" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h1 className="libre">Property Submitted!</h1>
            <p className="encode">Your property has been submitted for review. We'll notify you once it's approved.</p>
            <button className="lp-submit-final encode" style={{ marginTop: '40px' }} onClick={() => navigate('/')}>
              Back to Home
            </button>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        <form className="lp-form" onSubmit={handleSubmit}>

          <div className="form-section">
            <h2 className="libre">Property Details</h2>
            <div className="lp-grid">
              <div className="lp-group">
                <label className="encode">Property Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Luxury Sea-View Apartment"
                  className="encode"
                  required
                />
              </div>
              <div className="lp-group">
                <label className="encode">Project Name</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  placeholder="e.g., Mivida"
                  className="encode"
                />
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
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  min="0"
                  className="encode"
                />
              </div>
              <div className="lp-group">
                <label className="encode">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  min="0"
                  className="encode"
                />
              </div>
              <div className="lp-group">
                <label className="encode">Max Guests</label>
                <input
                  type="number"
                  name="maxGuests"
                  value={formData.maxGuests}
                  onChange={handleInputChange}
                  min="1"
                  className="encode"
                />
              </div>
              <div className="lp-group">
                <label className="encode">Square Footage (sqft)</label>
                <input
                  type="number"
                  name="sqft"
                  value={formData.sqft}
                  onChange={handleInputChange}
                  placeholder="e.g., 1200"
                  className="encode"
                />
              </div>
              <div className="lp-group">
                <label className="encode">Price per Night ($) *</label>
                <input
                  type="text"
                  name="pricePerNight"
                  value={formData.pricePerNight}
                  onChange={handleInputChange}
                  placeholder="e.g., 250"
                  className="encode"
                  required
                />
              </div>
              <div className="lp-group">
                <label className="encode">Furnished or not?</label>
                <div className="lp-pill-container">
                  <button
                    type="button"
                    className={`lp-pill encode ${furnished === 'yes' ? 'active' : ''}`}
                    onClick={() => setFurnished('yes')}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`lp-pill encode ${furnished === 'no' ? 'active' : ''}`}
                    onClick={() => setFurnished('no')}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
            <div className="lp-group full" style={{ marginTop: '40px' }}>
              <label className="encode">Description</label>
              <textarea
                rows="5"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="encode"
                placeholder="Describe the view, furniture, and unique experience..."
              ></textarea>
            </div>
          </div>

          <div className="form-section">
            <h2 className="libre">Set Location</h2>
            <p className="encode section-desc">Search for a location, click on the map, or use current location to pin your property.</p>
            <div className="map-container-box">
              <div className="map-search-wrapper">
                <div className="map-search-input-row">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <input
                    type="text"
                    className="encode map-search-input"
                    placeholder="Search for a location in Egypt..."
                    value={searchQuery}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    autoComplete="off"
                  />
                  {searching && <span className="loc-spinner" style={{ marginRight: '8px' }}></span>}
                </div>
                {searchResults.length > 0 && (
                  <div className="map-search-dropdown">
                    {searchResults.map((result, idx) => (
                      <div
                        key={idx}
                        className="map-search-result encode"
                        onClick={() => handleSelectSearchResult(result)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        <span>{result.display_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div ref={mapRef} id="leaflet-map" style={{ width: '100%', height: '400px', border: '2px solid #081621', borderRadius: '4px' }}></div>
              <div className="map-actions-row">
                <button type="button" className="pin-loc-btn encode" onClick={handlePinCurrentLocation} disabled={locating}>
                  {locating ? (
                    <>
                      <span className="loc-spinner"></span>
                      Locating...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
                      </svg>
                      Pin Current Location
                    </>
                  )}
                </button>
                {formData.latitude && (
                  <span className="encode coords-display">
                    📍 {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                  </span>
                )}
              </div>
              {formData.locationName && (
                <div className="location-name-display encode">
                  <strong>Location:</strong> {formData.locationName}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h2 className="libre">Nearby Essentials</h2>
            <p className="encode section-desc">Select services available within walking distance.</p>
            <div className="essentials-grid">
              {essentials.map((item, idx) => (
                <label key={idx} className="custom-checkbox-label encode">
                  <input
                    type="checkbox"
                    checked={nearby.includes(item)}
                    onChange={() => handleNearbyChange(item)}
                  />
                  <span className="box-checkmark"></span>
                  {item}
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2 className="libre">Property Images</h2>
            <p className="encode section-desc">Upload at least 4 high-quality interior and exterior photos.</p>
            <div className="upload-zone-wrapper">
              <label htmlFor="property-upload" className="image-drop-zone">
                <div className="upload-ui">
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  <span className="encode">Click to select property photos</span>
                </div>
              </label>
              <input id="property-upload" type="file" multiple onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />

              <div className="image-preview-flex">
                {previewUrls.map((image, index) => (
                  <div key={index} className="image-preview-card">
                    <img src={image} alt={`Property preview ${index}`} />
                    <button type="button" className="remove-img-btn" onClick={() => removeImage(index)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                    {index === 0 && (
                      <span style={{
                        position: 'absolute', bottom: '8px', left: '8px',
                        background: '#112a3d', color: '#f6f3eb', padding: '3px 10px',
                        borderRadius: '12px', fontSize: '0.65rem', fontWeight: '800',
                        textTransform: 'uppercase', letterSpacing: '1px',
                      }}>Cover</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lp-action-footer">
            {uploadProgress && (
              <p className="encode" style={{ textAlign: 'center', color: '#112a3d', fontWeight: '700', marginBottom: '16px' }}>
                {uploadProgress}
              </p>
            )}
            <button type="submit" className="lp-submit-final encode" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Property For Review'}
            </button>
            <p className="encode terms-hint">By submitting, you agree to our standard quality and safety compliance.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListProperty;