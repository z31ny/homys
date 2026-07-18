import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Waves, Wind, Wifi, Coffee, Users, 
  Edit3, DollarSign, TrendingUp 
} from 'lucide-react';
import './ViewProperty.css';

const ViewProperty = () => {
  const navigate = useNavigate();

  return (
    <div className="view-property-page">
      {/* Top Breadcrumb / Action Bar */}
      <header className="page-header">
        <button className="back-link" onClick={() => navigate('/properties')}>
          <ArrowLeft size={18}/> Back to Properties
        </button>
        <div className="header-right">
          <div className="status-pill active">Active</div>
          <button className="btn-edit-header" onClick={() => navigate('/edit-property')}>
            <Edit3 size={18}/> Edit Property
          </button>
        </div>
      </header>

      <div className="view-content-grid">
        {/* Left: Main Details */}
        <div className="details-column">
          <div className="hero-gallery">
            <img 
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80" 
              alt="Beachfront Villa" 
              className="main-view-img"
            />
          </div>

          <div className="info-section">
            <h1 className="display-title">Beachfront Villa</h1>
            <div className="location-meta">
              <MapPin size={18} color="var(--color-gold)"/>
              <span>Sahel, North Coast, Egypt</span>
            </div>

            <div className="pricing-overview">
              <span className="type-label">Villa</span>
              <span className="price-label"><strong>EGP 2,500</strong> / night</span>
            </div>

            <div className="description-block">
              <h3>Description</h3>
              <p>
                Experience luxury living in this stunning beachfront villa. Featuring floor-to-ceiling windows, 
                a private infinity pool, and direct access to the Mediterranean Sea. Perfect for families 
                seeking a premium summer retreat.
              </p>
            </div>

            <div className="amenities-block">
              <h3>Amenities</h3>
              <div className="amenities-flex">
                <div className="amenity-item"><Waves size={20}/> Beachfront</div>
                <div className="amenity-item"><Wind size={20}/> AC</div>
                <div className="amenity-item"><Wifi size={20}/> High-speed WiFi</div>
                <div className="amenity-item"><Coffee size={20}/> Breakfast</div>
                <div className="amenity-item"><Users size={20}/> 8 Guests</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats Sidebar */}
        <aside className="view-sidebar">
          <div className="stat-widget">
            <div className="widget-row">
              <label>Current Occupancy</label>
              <span className="gold-val">92%</span>
            </div>
            <div className="progress-track">
              <div className="progress-bar" style={{width: '92%'}}></div>
            </div>
          </div>

          <div className="summary-cards">
            <div className="summary-item">
              <div className="s-icon"><DollarSign size={24}/></div>
              <div className="s-text">
                <label>Monthly Revenue</label>
                <strong>EGP 75,000</strong>
              </div>
            </div>
            <div className="summary-item">
              <div className="s-icon"><TrendingUp size={24}/></div>
              <div className="s-text">
                <label>Avg. Daily Rate</label>
                <strong>EGP 2,450</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ViewProperty;
