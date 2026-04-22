import React, { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Properties.css';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchProperties = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    adminAPI.getProperties(params)
      .then((res) => setProperties(res.data.properties || []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProperties(); }, [statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(id);
    try {
      await adminAPI.updatePropertyStatus(id, newStatus);
      setProperties(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = properties.filter(p => {
    const q = search.toLowerCase();
    return !q || p.title.toLowerCase().includes(q) || (p.locationName || '').toLowerCase().includes(q);
  });

  const statusColor = (s) => {
    if (s === 'approved') return '#4caf82';
    if (s === 'pending_review') return '#f9a825';
    if (s === 'rejected') return '#ef4444';
    return '#8b8b8b';
  };

  return (
    <div className="properties-container">
      <header className="properties-toolbar">
        <div className="properties-filters">
          <div className="properties-search-wrapper">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search properties..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="properties-filter-dropdown" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </header>

      {loading ? (
        <p style={{ padding: '40px', opacity: 0.6 }}>Loading properties...</p>
      ) : (
        <div className="properties-grid">
          {filtered.length > 0 ? filtered.map((prop) => (
            <div key={prop.id} className="properties-card">
              <div className="properties-card-img-wrap">
                {prop.heroImageUrl ? (
                  <img src={prop.heroImageUrl} alt={prop.title} />
                ) : (
                  <div style={{ height: '100%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b8b8b' }}>No Image</div>
                )}
                <span className="properties-status-badge" style={{ background: statusColor(prop.status) }}>{prop.status.replace('_', ' ')}</span>
              </div>
              <div className="properties-card-content">
                <h3 className="properties-item-name">{prop.title}</h3>
                <div className="properties-item-loc">
                  <MapPin size={14} />
                  <span>{prop.locationName || 'No location'}</span>
                </div>
                <div className="properties-price-row">
                  <span className="properties-type-badge">{prop.propertyType}</span>
                  <p className="properties-price-text"><strong>${prop.pricePerNight}</strong>/night</p>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#8b8b8b', margin: '8px 0 0' }}>Owner: {prop.ownerName || 'Unknown'}</p>
                {prop.status === 'pending_review' && (
                  <div className="properties-card-actions">
                    <button
                      className="properties-btn-view"
                      onClick={() => handleStatusChange(prop.id, 'approved')}
                      disabled={actionLoading === prop.id}
                    >
                      <CheckCircle size={18} /> Approve
                    </button>
                    <button
                      className="properties-btn-edit"
                      onClick={() => handleStatusChange(prop.id, 'rejected')}
                      disabled={actionLoading === prop.id}
                      style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    >
                      <XCircle size={18} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#8b8b8b' }}>
              <h3>No properties found</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Properties;
