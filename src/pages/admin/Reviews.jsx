import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Star } from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Bookings.css'; // reuse same table styles

const renderStars = (rating) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={13}
      fill={i < rating ? '#c4a369' : 'none'}
      stroke={i < rating ? '#c4a369' : '#ccc'}
    />
  ));

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
        background: '#fff', borderRadius: 16, padding: '32px 36px',
        maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <p style={{ fontSize: '1rem', color: '#112a3d', marginBottom: 24, lineHeight: 1.6 }}>
        {message}
      </p>
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
          {loading ? 'Processing…' : 'Confirm'}
        </button>
      </div>
    </div>
  </div>
);

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('pending'); // default to pending — most useful view
  const [actionLoading, setActionLoading] = useState(null);
  const [confirm, setConfirm] = useState(null); // { id, action: 'approve' | 'reject' }

  const fetchReviews = () => {
    setLoading(true);
    // The existing endpoint only returns pending reviews.
    // We hit it and then optionally filter client-side.
    adminAPI.getPendingReviews()
      .then((res) => setReviews(res.data?.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleConfirm = async () => {
    if (!confirm) return;
    const { id, action } = confirm;
    setActionLoading(id);
    try {
      if (action === 'approve') {
        await adminAPI.approveReview(id);
        setReviews((prev) => prev.map((r) => r.id === id ? { ...r, _localStatus: 'approved' } : r));
      } else {
        await adminAPI.rejectReview(id);
        setReviews((prev) => prev.map((r) => r.id === id ? { ...r, _localStatus: 'rejected' } : r));
      }
    } catch (err) {
      alert(err.message || 'Action failed.');
    } finally {
      setActionLoading(null);
      setConfirm(null);
    }
  };

  // Reviews that have been acted on in this session get a _localStatus
  // Filter based on that + the current filter tab
  const filtered = reviews.filter((r) => {
    const effectiveStatus = r._localStatus || 'pending';
    const matchesFilter = filter === 'all' || effectiveStatus === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (r.userName || '').toLowerCase().includes(q) ||
      (r.propertyTitle || '').toLowerCase().includes(q) ||
      (r.comment || '').toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const pendingCount = reviews.filter((r) => !r._localStatus).length;

  return (
    <div className="bookings-page">
      {confirm && (
        <ConfirmModal
          message={
            confirm.action === 'approve'
              ? 'Approve this review? It will become publicly visible on the property page.'
              : 'Reject this review? It will remain hidden from the public.'
          }
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
          loading={!!actionLoading}
        />
      )}

      <div className="bookings-card">
        <div className="bookings-toolbar">
          <div className="bookings-toolbar-left">
            <div className="bookings-search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by guest, property, comment…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="bookings-filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="pending">Pending ({pendingCount})</option>
              <option value="approved">Approved this session</option>
              <option value="rejected">Rejected this session</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        <div className="bookings-table-wrapper">
          {loading ? (
            <p style={{ padding: '40px', opacity: 0.6 }}>Loading reviews...</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8b8b8b' }}>
              <Star size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
              <p>
                {filter === 'pending'
                  ? "No pending reviews — you're all caught up!"
                  : 'No reviews in this category.'}
              </p>
            </div>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>GUEST</th>
                  <th>PROPERTY</th>
                  <th>RATING</th>
                  <th>COMMENT</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const effectiveStatus = r._localStatus || 'pending';
                  const isActing = actionLoading === r.id;

                  return (
                    <tr key={r.id} className={idx % 2 !== 0 ? 'bookings-row-alt' : ''}>
                      <td style={{ fontWeight: 600 }}>
                        {r.userName || 'Guest'}
                        {r.userEmail && (
                          <div style={{ fontSize: '0.74rem', color: '#8b8b8b', fontWeight: 400 }}>
                            {r.userEmail}
                          </div>
                        )}
                      </td>
                      <td>{r.propertyTitle || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 2 }}>{renderStars(r.rating)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#8b8b8b', marginTop: 2 }}>
                          {r.rating}/5
                        </div>
                      </td>
                      <td
                        style={{
                          maxWidth: 260, fontSize: '0.83rem', color: '#334155',
                          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        }}
                      >
                        {r.comment || <em style={{ opacity: 0.4 }}>No comment</em>}
                      </td>
                      <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {new Date(r.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem',
                            fontWeight: 700,
                            background:
                              effectiveStatus === 'approved' ? '#e8f5e9' :
                              effectiveStatus === 'rejected' ? '#fdeaea' : '#fff8e1',
                            color:
                              effectiveStatus === 'approved' ? '#2e7d32' :
                              effectiveStatus === 'rejected' ? '#c0392b' : '#f57f17',
                          }}
                        >
                          {effectiveStatus}
                        </span>
                      </td>
                      <td>
                        {effectiveStatus === 'pending' ? (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap' }}>
                            <button
                              disabled={isActing}
                              onClick={() => setConfirm({ id: r.id, action: 'approve' })}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '7px 14px', borderRadius: 8, border: '1.5px solid #4caf82',
                                background: '#fff', color: '#4caf82', fontWeight: 700,
                                fontSize: '0.78rem', cursor: 'pointer',
                                opacity: isActing ? 0.5 : 1,
                              }}
                            >
                              <CheckCircle size={14} />
                              Approve
                            </button>
                            <button
                              disabled={isActing}
                              onClick={() => setConfirm({ id: r.id, action: 'reject' })}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '7px 14px', borderRadius: 8, border: '1.5px solid #ef4444',
                                background: '#fff', color: '#ef4444', fontWeight: 700,
                                fontSize: '0.78rem', cursor: 'pointer',
                                opacity: isActing ? 0.5 : 1,
                              }}
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', opacity: 0.5, fontStyle: 'italic' }}>
                            Done
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="bookings-footer">
          <p className="bookings-results-count">
            {filtered.length} review{filtered.length !== 1 ? 's' : ''} · {pendingCount} pending
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
