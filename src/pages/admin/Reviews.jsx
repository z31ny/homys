import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Trash2, Star } from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Bookings.css';

const renderStars = (rating) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={13} fill={i < rating ? '#c4a369' : 'none'} stroke={i < rating ? '#c4a369' : '#ccc'} />
  ));

const ConfirmModal = ({ message, onConfirm, onCancel, loading, danger }) => (
  <div
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
    onClick={onCancel}
  >
    <div
      style={{ background: '#fff', borderRadius: 16, padding: '32px 36px', maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <p style={{ fontSize: '1rem', color: '#112a3d', marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} disabled={loading}
          style={{ padding: '10px 22px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#666' }}>
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: danger ? '#ef4444' : '#112a3d', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
          {loading ? 'Processing…' : 'Confirm'}
        </button>
      </div>
    </div>
  </div>
);

const FILTERS = ['pending', 'approved', 'rejected', 'all'];

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);
  const [confirm, setConfirm] = useState(null); // { id, action: 'approve'|'reject'|'delete' }

  const fetchReviews = () => {
    setLoading(true);
    // Fetch all reviews so all filter tabs work without re-fetching
    adminAPI.getAllReviews()
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
        setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: 'approved' } : r));
      } else if (action === 'reject') {
        await adminAPI.rejectReview(id);
        setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: 'rejected' } : r));
      } else if (action === 'delete') {
        await adminAPI.deleteReview(id);
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      alert(err.message || 'Action failed.');
    } finally {
      setActionLoading(null);
      setConfirm(null);
    }
  };

  const counts = {
    pending:  reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
    all:      reviews.length,
  };

  const filtered = reviews.filter((r) => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (r.userName || '').toLowerCase().includes(q) ||
      (r.propertyTitle || '').toLowerCase().includes(q) ||
      (r.comment || '').toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bookings-page">
      {confirm && (
        <ConfirmModal
          danger={confirm.action === 'delete'}
          message={
            confirm.action === 'approve' ? 'Approve this review? It will become publicly visible on the property page.' :
            confirm.action === 'reject'  ? 'Reject this review? It will be hidden from the public.' :
            'Permanently delete this review? This cannot be undone. The guest will be able to submit a new review.'
          }
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
          loading={!!actionLoading}
        />
      )}

      <div className="bookings-card">
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.82rem', textTransform: 'capitalize',
                background: filter === f ? '#112a3d' : '#f5f2ec',
                color: filter === f ? '#f6f3eb' : '#112a3d',
                transition: 'all 0.2s',
              }}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>

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
          </div>
        </div>

        <div className="bookings-table-wrapper">
          {loading ? (
            <p style={{ padding: '40px', opacity: 0.6 }}>Loading reviews...</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8b8b8b' }}>
              <p>{filter === 'pending' ? 'No pending reviews — you\'re all caught up!' : `No ${filter} reviews.`}</p>
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
                  const isActing = actionLoading === r.id;
                  return (
                    <tr key={r.id} className={idx % 2 !== 0 ? 'bookings-row-alt' : ''}>
                      <td style={{ fontWeight: 600 }}>
                        {r.userName || 'Guest'}
                        {r.userEmail && <div style={{ fontSize: '0.74rem', color: '#8b8b8b', fontWeight: 400 }}>{r.userEmail}</div>}
                      </td>
                      <td>{r.propertyTitle || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 2 }}>{renderStars(r.rating)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#8b8b8b', marginTop: 2 }}>{r.rating}/5</div>
                      </td>
                      <td style={{ maxWidth: 220, fontSize: '0.83rem', color: '#334155', wordBreak: 'break-word' }}>
                        {r.comment || <em style={{ opacity: 0.4 }}>No comment</em>}
                      </td>
                      <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                          background: r.status === 'approved' ? '#e8f5e9' : r.status === 'rejected' ? '#fdeaea' : '#fff8e1',
                          color: r.status === 'approved' ? '#2e7d32' : r.status === 'rejected' ? '#c0392b' : '#f57f17',
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', alignItems: 'center' }}>
                          {r.status === 'pending' && (
                            <>
                              <button disabled={isActing} onClick={() => setConfirm({ id: r.id, action: 'approve' })}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1.5px solid #4caf82', background: '#fff', color: '#4caf82', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', opacity: isActing ? 0.5 : 1 }}>
                                <CheckCircle size={13} /> Approve
                              </button>
                              <button disabled={isActing} onClick={() => setConfirm({ id: r.id, action: 'reject' })}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1.5px solid #ef4444', background: '#fff', color: '#ef4444', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', opacity: isActing ? 0.5 : 1 }}>
                                <XCircle size={13} /> Reject
                              </button>
                            </>
                          )}
                          {r.status === 'approved' && (
                            <button disabled={isActing} onClick={() => setConfirm({ id: r.id, action: 'reject' })}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1.5px solid #ef4444', background: '#fff', color: '#ef4444', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', opacity: isActing ? 0.5 : 1 }}>
                              <XCircle size={13} /> Revoke
                            </button>
                          )}
                          {r.status === 'rejected' && (
                            <button disabled={isActing} onClick={() => setConfirm({ id: r.id, action: 'approve' })}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1.5px solid #4caf82', background: '#fff', color: '#4caf82', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', opacity: isActing ? 0.5 : 1 }}>
                              <CheckCircle size={13} /> Restore
                            </button>
                          )}
                          {/* Delete available on ALL statuses */}
                          <button disabled={isActing} onClick={() => setConfirm({ id: r.id, action: 'delete' })}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: '1.5px solid #ddd', background: '#fff', color: '#8b8b8b', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', opacity: isActing ? 0.5 : 1 }}
                            title="Delete review (allows guest to re-submit)">
                            <Trash2 size={13} />
                          </button>
                        </div>
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
            {filtered.length} review{filtered.length !== 1 ? 's' : ''} · {counts.pending} pending
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
