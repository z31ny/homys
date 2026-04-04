import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ListProperty.css';

const ListProperty = () => {
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [furnished, setFurnished] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map((file) =>
        URL.createObjectURL(file)
      );
      setSelectedImages((prevImages) => prevImages.concat(filesArray));
    }
  };

  const essentials = [
    "Pharmacy", "Supermarket", "Hospital", "Beach Access", 
    "Gym", "Restaurant", "Shopping Mall", "ATM / Bank",
    "Public Transport", "Cinema", "Park", "Security Hub"
  ];

  const handleNearbyChange = (item) => {
    setNearby(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="list-property-page">
      <button className="back-btn-global" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <div className="lp-container">
        <header className="lp-header">
          <h1 className="libre">List Your Sanctuary</h1>
          <p className="encode">Join the Homys collection and share your home with global travelers.</p>
        </header>

        <form className="lp-form" onSubmit={(e) => e.preventDefault()}>
          
          <div className="form-section">
            <h2 className="libre">Property Details</h2>
            <div className="lp-grid">
              <div className="lp-group">
                <label className="encode">Project Name</label>
                <input type="text" placeholder="e.g., Mivida" className="encode" />
              </div>
              <div className="lp-group">
                <label className="encode">Property Type</label>
                <select className="encode">
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>Chalet</option>
                  <option>Studio</option>
                </select>
              </div>
              <div className="lp-group">
                <label className="encode">Bedrooms</label>
                <input type="number" placeholder="0" className="encode" />
              </div>
              <div className="lp-group">
                <label className="encode">Bathrooms</label>
                <input type="number" placeholder="0" className="encode" />
              </div>
              <div className="lp-group">
                <label className="encode">Square Footage (sqft)</label>
                <input type="text" placeholder="e.g., 1200" className="encode" />
              </div>
              <div className="lp-group">
                <label className="encode">Expected Price per Night ($)</label>
                <input type="text" placeholder="e.g., 250" className="encode" />
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
            <div className="lp-group full" style={{marginTop: '40px'}}>
              <label className="encode">Description</label>
              <textarea rows="5" className="encode" placeholder="Describe the view, furniture, and unique experience..."></textarea>
            </div>
          </div>

          <div className="form-section">
            <h2 className="libre">Set Location</h2>
            <p className="encode section-desc">Pin your property precisely on the map for guests.</p>
            <div className="map-container-box">
              <iframe 
                title="property-location-map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3451.123!2d31.235!3d30.044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAyJzQwLjAiTiAzMcKwMTQnMDguNSJF!5e0!3m2!1sen!2seg!4v1620000000000!5m2!1sen!2seg" 
                width="100%" 
                height="400" 
                style={{ border: '2px solid #081621' }} 
                allowFullScreen="" 
                loading="lazy">
              </iframe>
              <button type="button" className="pin-loc-btn encode">Pin Current Location</button>
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
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span className="encode">Click to select property photos</span>
                </div>
              </label>
              <input id="property-upload" type="file" multiple onChange={handleImageChange} accept="image/*" style={{display: 'none'}} />
              
              <div className="image-preview-flex">
                {selectedImages.map((image, index) => (
                  <div key={index} className="image-preview-card">
                    <img src={image} alt={`Property preview ${index}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="libre">Contact Information</h2>
            <div className="lp-grid">
              <div className="lp-group">
                <label className="encode">Owner Full Name</label>
                <input type="text" placeholder="Enter your name" className="encode" />
              </div>
              <div className="lp-group">
                <label className="encode">Email Address</label>
                <input type="email" placeholder="email@example.com" className="encode" />
              </div>
              <div className="lp-group full">
                <label className="encode">Phone Number</label>
                <input type="tel" placeholder="+20 000 000 0000" className="encode" />
              </div>
            </div>
          </div>

          <div className="lp-action-footer">
            <button type="submit" className="lp-submit-final encode">Submit Property For Review</button>
            <p className="encode terms-hint">By submitting, you agree to our standard quality and safety compliance.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListProperty;