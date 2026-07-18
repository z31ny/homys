import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Percent, Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell,
} from 'recharts';
import { adminAPI } from '../../services/api';
import './Analytics.css';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const fmt = (v) => `EGP ${Math.round(v).toLocaleString('en-EG')}`;

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    Promise.all([
      adminAPI.getStats(),
      adminAPI.getBookings({ limit: 200 }),
      adminAPI.getProperties({ limit: 50 }),
    ])
      .then(([statsRes, bookingsRes, propertiesRes]) => {
        setStats(statsRes.data);
        setBookings(bookingsRes.data.bookings || []);
        setProperties(propertiesRes.data.properties || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="analytics-container"><p style={{ padding: '60px', opacity: 0.6 }}>Loading analytics...</p></div>;
  }

  // ── Monthly revenue for selected year ──────────────────────────────
  const monthlyData = MONTH_NAMES.map((month, i) => {
    const monthBookings = bookings.filter((b) => {
      const d = new Date(b.createdAt || b.checkIn);
      return !isNaN(d) && d.getFullYear() === selectedYear && d.getMonth() === i;
    });
    const revenue = monthBookings.reduce((s, b) => s + parseFloat(b.totalPrice || 0), 0);
    const count = monthBookings.length;
    return { month, revenue: Math.round(revenue), count };
  });

  // Available years from bookings
  const years = [...new Set(bookings.map((b) => new Date(b.createdAt || b.checkIn).getFullYear()).filter(Boolean))].sort((a, b) => b - a);
  if (!years.includes(selectedYear) && years.length > 0) years.unshift(selectedYear);

  // ── Revenue by location ────────────────────────────────────────────
  const locationRevMap = {};
  bookings.forEach((b) => {
    const loc = (b.propertyLocation || 'Other').split(',')[0].trim().slice(0, 14);
    locationRevMap[loc] = (locationRevMap[loc] || 0) + parseFloat(b.totalPrice || 0);
  });
  const barData = Object.entries(locationRevMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([name, value]) => ({ name, value: Math.round(value) }));

  // ── Top properties ─────────────────────────────────────────────────
  const propMap = {};
  bookings.forEach((b) => {
    const title = b.propertyTitle || 'Unknown';
    if (!propMap[title]) propMap[title] = { bookings: 0, revenue: 0 };
    propMap[title].bookings++;
    propMap[title].revenue += parseFloat(b.totalPrice || 0);
  });
  const topProperties = Object.entries(propMap).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5)
    .map(([name, data], idx) => ({ rank: idx + 1, name, revenue: fmt(data.revenue), bookings: data.bookings }));

  const totalRevenue = stats?.totalRevenue || 0;
  const avgNightly = properties.length
    ? (properties.reduce((s, p) => s + parseFloat(p.pricePerNight || 0), 0) / properties.length).toFixed(0)
    : 0;

  const yearTotal = monthlyData.reduce((s, m) => s + m.revenue, 0);
  const bestMonth = [...monthlyData].sort((a, b) => b.revenue - a.revenue)[0];

  return (
    <div className="analytics-container">
      <div className="analytics-stats-grid">
        <StatCard title="TOTAL REVENUE" value={fmt(totalRevenue)} sub={`${stats?.totalBookings || 0} total bookings`} icon={<DollarSign size={20} />} />
        <StatCard title="AVG NIGHTLY RATE" value={`EGP ${parseInt(avgNightly).toLocaleString()}`} sub="across approved listings" icon={<TrendingUp size={20} />} />
        <StatCard title="ACTIVE STAYS" value={stats?.activeStays ?? 0} sub="confirmed + upcoming" icon={<Percent size={20} />} />
        <StatCard title="TOTAL USERS" value={stats?.totalUsers ?? 0} sub="registered accounts" icon={<Users size={20} />} />
      </div>

      {/* ── Monthly Revenue ── */}
      <div className="analytics-chart-box" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 className="analytics-chart-title" style={{ margin: 0 }}>Monthly Revenue</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#8b8b8b' }}>
              {selectedYear} total: <strong style={{ color: '#112a3d' }}>{fmt(yearTotal)}</strong>
              {bestMonth?.revenue > 0 && <> · Best month: <strong style={{ color: '#c4a369' }}>{bestMonth.month}</strong></>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: 'none',
                  background: y === selectedYear ? '#112a3d' : '#f0ece4',
                  color: y === selectedYear ? '#f6f3eb' : '#112a3d',
                }}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        <div className="analytics-chart-wrapper">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8e0d4" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} tickFormatter={(v) => v === 0 ? '0' : `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                cursor={{ fill: 'rgba(196,163,105,0.08)' }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={{ background: '#fff', border: '1px solid #e0d9ce', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem' }}>
                      <p style={{ fontWeight: 700, margin: '0 0 4px', color: '#112a3d' }}>{label} {selectedYear}</p>
                      <p style={{ margin: 0, color: '#c4a369' }}>Revenue: {fmt(payload[0]?.value || 0)}</p>
                      <p style={{ margin: 0, color: '#8b8b8b' }}>Bookings: {payload[0]?.payload?.count}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {monthlyData.map((entry, index) => (
                  <Cell key={index} fill={entry.revenue === (bestMonth?.revenue || 0) && entry.revenue > 0 ? '#c4a369' : '#d9cfc4'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Revenue by Location ── */}
      {barData.length > 0 && (
        <div className="analytics-charts-row">
          <div className="analytics-chart-box">
            <h3 className="analytics-chart-title">Revenue by Location</h3>
            <div className="analytics-chart-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e0e0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#555', fontSize: 11 }} width={80} />
                  <Tooltip cursor={{ fill: 'transparent' }} formatter={(v) => [fmt(v), 'Revenue']} />
                  <Bar dataKey="value" fill="#c4a369" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="analytics-chart-box">
            <h3 className="analytics-chart-title">Revenue Trend (All Time)</h3>
            <div className="analytics-chart-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyData.filter((m) => m.revenue > 0)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => [fmt(v), 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#1b2533" strokeWidth={2.5} dot={{ r: 3, fill: '#1b2533' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Properties ── */}
      <div className="analytics-table-card">
        <h3 className="analytics-chart-title">Top Highest-Earning Properties</h3>
        {topProperties.length === 0 ? (
          <p style={{ padding: '30px', opacity: 0.5 }}>No booking data yet.</p>
        ) : (
          <div className="analytics-table-responsive">
            <table className="analytics-table">
              <thead>
                <tr><th>RANK</th><th>PROPERTY</th><th>TOTAL REVENUE</th><th>BOOKINGS</th></tr>
              </thead>
              <tbody>
                {topProperties.map((prop, idx) => (
                  <tr key={prop.rank} className={idx % 2 !== 0 ? 'analytics-alt-row' : ''}>
                    <td><span className="analytics-rank-badge">{prop.rank}</span></td>
                    <td className="analytics-prop-name">{prop.name}</td>
                    <td className="analytics-prop-val">{prop.revenue}</td>
                    <td>{prop.bookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, sub, icon }) => (
  <div className="analytics-stat-card">
    <div className="analytics-stat-card-header">
      <div className="analytics-stat-text">
        <span className="analytics-stat-title">{title}</span>
        <h2 className="analytics-stat-value">{value}</h2>
      </div>
      <div className="analytics-stat-icon">{icon}</div>
    </div>
    {sub && <div className="analytics-stat-trend"><span className="analytics-trend-sub">{sub}</span></div>}
  </div>
);

export default Analytics;
