import React, { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle, XCircle, Archive, RotateCcw } from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Properties.css';

const STATUS_COLOR = {
  approved:       '#4caf82',
  pending_review: '#f9a825',
  rejected:       '#ef4444',
  archived:       '#8b8b8b',
};

const STATUS_LABEL = {
  approved:       'Approved',
  pending_review: 'Pending Review',
  rejected:       'Rejected',
  archived:       'Archived',
};

// Which action buttons to show per current status
const ACTIONS = {
  pending_review: [
    { label: 'Approve',  nextStatus: 'approved',  icon: <CheckCircle size={15} />, color: '#4caf82' },
    { label: 'Reject',   nextStatus: 'rejected',   icon: <XCircle    size={15} />, color: '#ef4444' },
  ],
  approved: [
    { label: 'Reject',   nextStatus: 'rejected',   icon: <XCircle    size={15} />, color: '#ef4444' },
    { label: 'Archive',  nextStatus: 'archived',   icon: <Archive    size={15} />, color: '#8b8b8b' },
  ],
  rejected: [
    { label: 'Approve',  nextStatus: 'approved',   icon: <CheckCircle size={15} />, color: '#4caf82' },
    { label: 'Archive',  nextStatus: 'archived',   icon: <Archive    size={15} />, color: '#8b8b8b' },
  ],
  archived: [
    { label: 'Restore',  nextStatus: 'approved',   icon: <RotateCcw  size={15} />, color: '#4caf82' },
  ],
};

// Confirm modal
const ConfirmModal = ({ message, onConfirm, onCancel, loading }) => (
  <div
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}
    onClick={onCancel}
  >
    <div
      style={{
        background: '#fff', borderRadius: 16, padding: '32px 36px', maxWidth: 420,
        width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <p style={{ fontSize: '1rem', color: '#112a3d', marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: '10px 22px', borderRadius: 8, border: '1px solid #ddd',
            background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#666',
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            padding: '10px 22px', borderRadius: 8, border: 'none',
            background: '#112a3d', color: '#f6f3eb', cursor: 'pointer', fontWeight: 700,
          }}
        >
          {loading ? 'Updating…' : 'Confirm'}
        </button>
      </div>
    </div>
  </div>
);

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [confirm, setConfirm] = useState(null); // { id, nextStatus, label }

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

  const handleAction = (id, nextStatus, label) => {
    setConfirm({ id, nextStatus, label });
  };

  const executeAction = async () => {
    if (!confirm) return;
    const { id, nextStatus } = confirm;
    setActionLoading(id);
    try {
      await adminAPI.updatePropertyStatus(id, nextStatus);
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p))
      );
    } catch (err) {
      alert(err.message || 'Failed to update property status.');
    } finally {
      setActionLoading(null);
      setConfirm(null);
    }
  };

  const filtered = properties.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.locationName || '').toLowerCase().includes(q) ||
      (p.ownerName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="properties-container">
      {confirm && (
        <ConfirmModal
          message={`Set this property to "${STATUS_LABEL[confirm.nextStatus] || confirm.nextStatus}"?`}
          onConfirm={executeAction}
          onCancel={() => setConfirm(null)}
          loading={!!actionLoading}
        />
      )}

      <header className="properties-toolbar">
        <div className="properties-filters">
          <div className="properties-search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, location, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="properties-filter-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="properties-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: '#e8e0d4', borderRadius: 20, minHeight: 340, opacity: 0.4 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#8b8b8b' }}>
          <h3>No properties found</h3>
          <p style={{ marginTop: 8, fontSize: '0.9rem' }}>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="properties-grid">
          {filtered.map((prop) => {
            const actions = ACTIONS[prop.status] || [];
            const isActing = actionLoading === prop.id;

            return (
              <div key={prop.id} className="properties-card">
                <div className="properties-card-img-wrap">
                  {prop.heroImageUrl ? (
                    <img src={prop.heroImageUrl} alt={prop.title} />
                  ) : (
                    <div
                      style={{
                        height: '100%', background: '#e2e8f0',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#8b8b8b', fontSize: '0.85rem',
                      }}
                    >
                      No Image
                    </div>
                  )}
                  <span
                    className="properties-status-badge"
                    style={{ background: STATUS_COLOR[prop.status] || '#8b8b8b' }}
                  >
                    {STATUS_LABEL[prop.status] || prop.status}
                  </span>
                </div>

                <div className="properties-card-content">
                  <h3 className="properties-item-name">{prop.title}</h3>
                  <div className="properties-item-loc">
                    <MapPin size={13} />
                    <span>{prop.locationName || 'No location'}</span>
                  </div>
                  <div className="properties-price-row">
                    <span className="properties-type-badge" style={{ textTransform: 'capitalize' }}>
                      {prop.propertyType}
                    </span>
                    <p className="properties-price-text">
                      <strong>${prop.pricePerNight}</strong>/night
                    </p>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#8b8b8b', margin: '0 0 12px' }}>
                    {prop.bedrooms}bd · {prop.bathrooms}ba · {prop.maxGuests} guests
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#8b8b8b', margin: '0 0 14px' }}>
                    Owner: <strong>{prop.ownerName || 'Unknown'}</strong>
                    {prop.ownerEmail ? ` · ${prop.ownerEmail}` : ''}
                  </p>

                  {actions.length > 0 && (
                    <div className="properties-card-actions">
                      {actions.map((action) => (
                        <button
                          key={action.nextStatus}
                          className="properties-btn-view"
                          style={{
                            borderColor: action.color,
                            color: action.color,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            flex: 1,
                            justifyContent: 'center',
                            opacity: isActing ? 0.5 : 1,
                          }}
                          disabled={isActing}
                          onClick={() => handleAction(prop.id, action.nextStatus, action.label)}
                        >
                          {action.icon}
                          {isActing ? '…' : action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Properties;
