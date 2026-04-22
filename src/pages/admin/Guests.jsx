import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Guests.css';

const Guests = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminAPI.getUsers({ limit: 50 })
      .then((res) => setUsers(res.data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="bookings-page">
      <div className="bookings-card">
        <div className="bookings-toolbar">
          <div className="bookings-toolbar-left">
            <div className="bookings-search-box">
              <Search size={18} />
              <input type="text" placeholder="Search guests..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bookings-table-wrapper">
          {loading ? (
            <p style={{ padding: '40px', opacity: 0.6 }}>Loading guests...</p>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>PHONE</th>
                  <th>COUNTRY</th>
                  <th>ROLE</th>
                  <th>JOINED</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((u, idx) => (
                  <tr key={u.id} className={idx % 2 !== 0 ? 'bookings-row-alt' : ''}>
                    <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>{u.country || '—'}</td>
                    <td><span className={`admin-status-badge ${u.isAdmin ? 'confirmed' : 'pending'}`}>{u.isAdmin ? 'Admin' : 'User'}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#8b8b8b' }}>No guests found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="bookings-footer">
          <p className="bookings-results-count">{filtered.length} guests</p>
        </div>
      </div>
    </div>
  );
};

export default Guests;
