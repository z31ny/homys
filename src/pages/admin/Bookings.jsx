import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    setLoading(true);
    adminAPI.getBookings({ page, limit: 20 })
      .then((res) => {
        setBookings(res.data.bookings || []);
        setPagination(res.data.pagination || {});
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    return !q || (b.guestFirstName || '').toLowerCase().includes(q) ||
      (b.guestLastName || '').toLowerCase().includes(q) ||
      (b.propertyTitle || '').toLowerCase().includes(q) ||
      (b.userName || '').toLowerCase().includes(q);
  });

  return (
    <div className="bookings-page">
      <div className="bookings-card">
        <div className="bookings-toolbar">
          <div className="bookings-toolbar-left">
            <div className="bookings-search-box">
              <Search size={18} />
              <input type="text" placeholder="Search bookings..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
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
                  <th>PROPERTY</th>
                  <th>LOCATION</th>
                  <th>CHECK-IN</th>
                  <th>CHECK-OUT</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((b, idx) => (
                  <tr key={b.id} className={idx % 2 !== 0 ? 'bookings-row-alt' : ''}>
                    <td>{b.guestFirstName} {b.guestLastName}</td>
                    <td>{b.propertyTitle || '—'}</td>
                    <td>{b.propertyLocation || '—'}</td>
                    <td>{b.checkIn}</td>
                    <td>{b.checkOut}</td>
                    <td>${b.totalPrice}</td>
                    <td><span className={`admin-status-badge ${b.status}`}>{b.status}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#8b8b8b' }}>No bookings found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="bookings-footer">
          <p className="bookings-results-count">Showing {filtered.length} of {pagination.total || 0} bookings</p>
          <div className="bookings-pagination">
            <button className="bookings-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            <button className="bookings-page-btn active">{page}</button>
            <button className="bookings-page-btn" disabled={page >= (pagination.totalPages || 1)} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
