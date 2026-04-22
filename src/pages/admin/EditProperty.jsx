import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, X, Upload, MapPin, Tag, DollarSign, AlignLeft, Image as ImageIcon 
} from 'lucide-react';
import './EditProperty.css';

const EditProperty = () => {
  const navigate = useNavigate();

  return (
    <div className="edit-property-page">
      <header className="edit-top-bar">
        <div className="edit-title-group">
          <h1>Edit Property</h1>
          <p>Update information for <strong>Beachfront Villa</strong></p>
        </div>
        <div className="edit-actions">
          <button className="btn-cancel" onClick={() => navigate('/view-property')}>
            <X size={18}/> Cancel
          </button>
          <button className="btn-save-main" onClick={() => navigate('/view-property')}>
            <Save size={18}/> Save Changes
          </button>
        </div>
      </header>

      <div className="edit-main-grid">
        {/* Left Side: Inputs */}
        <div className="form-column">
          <div className="input-field">
            <label>Property Title</label>
            <input type="text" defaultValue="Beachfront Villa" />
          </div>

          <div className="input-row">
            <div className="input-field">
              <label><MapPin size={14}/> Location</label>
              <select defaultValue="Sahel">
                <option>Sahel</option>
                <option>Cairo</option>
                <option>Gouna</option>
              </select>
            </div>
            <div className="input-field">
              <label><Tag size={14}/> Property Type</label>
              <select defaultValue="Villa">
                <option>Villa</option>
                <option>Apartment</option>
                <option>Studio</option>
              </select>
            </div>
          </div>

          <div className="input-row">
            <div className="input-field">
              <label><DollarSign size={14}/> Price per Night (EGP)</label>
              <input type="number" defaultValue="2500" />
            </div>
            <div className="input-field">
              <label>Status</label>
              <div className="status-selector">
                <button className="sel-btn active">Active</button>
                <button className="sel-btn">Inactive</button>
              </div>
            </div>
          </div>

          <div className="input-field">
            <label><AlignLeft size={14}/> Description</label>
            <textarea rows="8" defaultValue="Experience luxury living in this stunning beachfront villa..."></textarea>
          </div>
        </div>

        {/* Right Side: Media Management */}
        <aside className="media-column">
          <div className="media-header">
            <ImageIcon size={18}/>
            <span>Property Media</span>
          </div>
          
          <div className="upload-dropzone">
            <Upload size={30} color="var(--color-gold)"/>
            <p>Click or drag to upload</p>
            <span>Max 10MB (JPG, PNG)</span>
          </div>

          <div className="image-preview-list">
            {[1, 2].map(i => (
              <div className="preview-card" key={i}>
                <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80" alt="Villa" />
                <button className="btn-remove-img"><X size={14}/></button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EditProperty;
