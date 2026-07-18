import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Guests.css';

const GENDER_LABELS = { male: 'Male', female: 'Female', other: 'Other' };

// Muted, on-brand tones (navy / warm gold / neutral) instead of bright pastels
const GENDER_STYLE = {
  male:   { background: '#eaeef2', color: '#3c5874' },
  female: { background: '#f4ebe2', color: '#9a6a3f' },
  other:  { background: '#f0ece4', color: '#6b6257' },
};
const AGE_STYLE  = { background: '#f0ece4', color: '#112a3d' }; // uniform — column already names the range
const ROLE_ADMIN = { background: '#d1a67a', color: '#112a3d' }; // gold accent
const ROLE_USER  = { background: '#f0ece4', color: '#7a6f5f' };

const Guests = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('');

  useEffect(() => {
    adminAPI.getUsers({ limit: 100 })
      .then((res) => setUsers(res.data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q);
    const matchGender = !genderFilter || u.gender === genderFilter;
    const matchAge = !ageFilter || u.ageRange === ageFilter;
    return matchSearch && matchGender && matchAge;
  });

  // Quick stats from filtered set
  const genderCounts = { male: 0, female: 0, other: 0, unknown: 0 };
  const ageCounts = { '18-25': 0, '26-35': 0, '36-50': 0, '50+': 0, unknown: 0 };
  filtered.forEach((u) => {
    if (u.gender) genderCounts[u.gender] = (genderCounts[u.gender] || 0) + 1;
    else genderCounts.unknown++;
    if (u.ageRange) ageCounts[u.ageRange] = (ageCounts[u.ageRange] || 0) + 1;
    else ageCounts.unknown++;
  });

  return (
    <div className="guests-page">
      <div className="guests-card">
        {/* ── Summary chips ── */}
        <div className="guests-chips">
          {[
            { label: 'Total', value: filtered.length, primary: true },
            { label: 'Male', value: genderCounts.male },
            { label: 'Female', value: genderCounts.female },
            { label: '18-25', value: ageCounts['18-25'] },
            { label: '26-35', value: ageCounts['26-35'] },
            { label: '36-50', value: ageCounts['36-50'] },
            { label: '50+',   value: ageCounts['50+'] },
          ].map((chip) => (
            <div key={chip.label} className={`guests-chip${chip.primary ? ' guests-chip-primary' : ''}`}>
              <span className="guests-chip-label">{chip.label}</span>
              <span className="guests-chip-value">{chip.value}</span>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="guests-toolbar">
          <div className="guests-search-box">
            <Search size={18} />
            <input type="text" placeholder="Search guests…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="guests-filter-select" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <select className="guests-filter-select" value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}>
            <option value="">All Ages</option>
            <option value="18-25">18-25</option>
            <option value="26-35">26-35</option>
            <option value="36-50">36-50</option>
            <option value="50+">50+</option>
          </select>
        </div>

        <div className="guests-table-container">
          {loading ? (
            <p style={{ padding: '40px', opacity: 0.6 }}>Loading guests...</p>
          ) : (
            <table className="guests-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>PHONE</th>
                  <th>GENDER</th>
                  <th>AGE GROUP</th>
                  <th>COUNTRY</th>
                  <th>ROLE</th>
                  <th>JOINED</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((u, idx) => (
                  <tr key={u.id} className={idx % 2 !== 0 ? 'guests-row-highlight' : ''}>
                    <td className="g-name">{u.fullName}</td>
                    <td className="g-email">{u.email}</td>
                    <td>{u.phone || <span className="g-dash">—</span>}</td>
                    <td>
                      {u.gender ? (
                        <span className="g-badge" style={GENDER_STYLE[u.gender] || GENDER_STYLE.other}>
                          {GENDER_LABELS[u.gender] || u.gender}
                        </span>
                      ) : <span className="g-dash">—</span>}
                    </td>
                    <td>
                      {u.ageRange ? (
                        <span className="g-badge" style={AGE_STYLE}>{u.ageRange}</span>
                      ) : <span className="g-dash">—</span>}
                    </td>
                    <td>{u.country || <span className="g-dash">—</span>}</td>
                    <td>
                      <span className="g-badge" style={u.isAdmin ? ROLE_ADMIN : ROLE_USER}>
                        {u.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="g-date">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#8b8b8b' }}>No guests found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="guests-footer">
          <p className="guests-footer-stats">{filtered.length} guests</p>
        </div>
      </div>
    </div>
  );
};

export default Guests;
