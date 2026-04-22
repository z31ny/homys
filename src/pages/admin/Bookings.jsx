import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Bookings.css';

const STATUSES = ['pending', 'confirmed', 'upcoming', 'completed', 'cancelled'];

const STATUS_COLOR = {
  pending:   '#f9a825',
  confirmed: '#3b82f6',
  upcoming:  '#f97316',
  completed: '#4caf82',
  cancelled: '#ef4444',
};

// Inline status-change dropdown per booking row
const StatusDropdown = ({ bookingId, currentStatus, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState(currentStatus);

  const handle = async (newStatus) => {
    if (newStatus === localStatus) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    try {
      await adminAPI.updateBookingStatus(bookingId, newStatus);
      setLocalStatus(newStatus);
      onUpdated(bookingId, newStatus);
    } catch (err) {
      alert(err.message || 'Failed to update booking status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: `1.5px solid ${STATUS_COLOR[localStatus] || '#ccc'}`,
          borderRadius: 20,
          padding: '4px 12px',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.75rem',
          color: STATUS_COLOR[localStatus] || '#666',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: 7, height: 7, borderRadius: '50%',
            background: STATUS_COLOR[localStatus] || '#ccc',
            display: 'inline-block',
          }}
        />
        {loading ? 'Saving…' : localStatus}
        {!loading && <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>▾</span>}
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 100 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute', top: '110%', left: 0, zIndex: 101,
              background: '#fff', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              minWidth: 150, overflow: 'hidden', border: '1px solid #eee',
            }}
          >
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => handle(s)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '10px 14px', border: 'none',
                  background: s === localStatus ? '#f5f2ec' : '#fff',
                  cursor: 'pointer', textAlign: 'left', fontWeight: s === localStatus ? 700 : 500,
                  fontSize: '0.82rem', color: STATUS_COLOR[s] || '#333',
                }}
              >
                <span
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: STATUS_COLOR[s] || '#ccc',
                    flexShrink: 0,
                  }}
                />
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchBookings = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    adminAPI.getBookings(params)
      .then((res) => {
        setBookings(res.data.bookings || []);
        setPagination(res.data.pagination || {});
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [page]);

  const handleStatusUpdated = (id, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (b.guestFirstName || '').toLowerCase().includes(q) ||
      (b.guestLastName || '').toLowerCase().includes(q) ||
      (b.propertyTitle || '').toLowerCase().includes(q) ||
      (b.userName || '').toLowerCase().includes(q) ||
      (b.guestEmail || '').toLowerCase().includes(q);
    const matchesStatus = !statusFilter || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bookings-page">
      <div className="bookings-card">
        <div className="bookings-toolbar">
          <div className="bookings-toolbar-left">
            <div className="bookings-search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search guest, property, email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="bookings-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bookings-table-wrapper">
          {loading ? (
            <p style={{ padding: '40px', opacity: 0.6 }}>Loading bookings...</p>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>GUEST</th>
                  <th>EMAIL</th>
                  <th>PROPERTY</th>
                  <th>CHECK-IN</th>
                  <th>CHECK-OUT</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((b, idx) => (
                    <tr key={b.id} className={idx % 2 !== 0 ? 'bookings-row-alt' : ''}>
                      <td style={{ fontWeight: 600 }}>
                        {b.guestFirstName} {b.guestLastName}
                        {b.guestPhone && (
                          <div style={{ fontSize: '0.75rem', color: '#8b8b8b', fontWeight: 400 }}>
                            {b.guestPhone}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{b.guestEmail || '—'}</td>
                      <td>
                        {b.propertyTitle || '—'}
                        {b.propertyLocation && (
                          <div style={{ fontSize: '0.75rem', color: '#8b8b8b' }}>{b.propertyLocation}</div>
                        )}
                      </td>
                      <td>{b.checkIn}</td>
                      <td>{b.checkOut}</td>
                      <td style={{ fontWeight: 700 }}>${b.totalPrice}</td>
                      <td>
                        <StatusDropdown
                          bookingId={b.id}
                          currentStatus={b.status}
                          onUpdated={handleStatusUpdated}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#8b8b8b' }}>
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="bookings-footer">
          <p className="bookings-results-count">
            Showing {filtered.length} of {pagination.total || 0} bookings
          </p>
          <div className="bookings-pagination">
            <button
              className="bookings-page-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button className="bookings-page-btn active">{page}</button>
            <button
              className="bookings-page-btn"
              disabled={page >= (pagination.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
