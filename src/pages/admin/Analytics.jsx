import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Percent, Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import { adminAPI } from '../../services/api';
import './Analytics.css';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminAPI.getStats(),
      adminAPI.getBookings({ limit: 50 }),
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
    return (
      <div className="analytics-container">
        <p style={{ padding: '60px', opacity: 0.6 }}>Loading analytics...</p>
      </div>
    );
  }

  // Revenue by location from real bookings
  const locationRevMap = {};
  bookings.forEach((b) => {
    const loc = b.propertyLocation || 'Other';
    const key = loc.split(',')[0].trim().slice(0, 14);
    locationRevMap[key] = (locationRevMap[key] || 0) + parseFloat(b.totalPrice || 0);
  });
  const barData = Object.entries(locationRevMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value: Math.round(value) }));

  // Monthly revenue trend from real bookings
  const monthOrder = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthMap = {};
  bookings.forEach((b) => {
    const d = new Date(b.createdAt || b.checkIn);
    if (!isNaN(d)) {
      const key = d.toLocaleString('en-US', { month: 'short' });
      monthMap[key] = (monthMap[key] || 0) + parseFloat(b.totalPrice || 0);
    }
  });
  const lineData = monthOrder
    .filter((m) => monthMap[m])
    .map((month) => ({ month, revenue: Math.round(monthMap[month]) }));

  // Top properties by revenue
  const propMap = {};
  bookings.forEach((b) => {
    const title = b.propertyTitle || 'Unknown';
    if (!propMap[title]) propMap[title] = { bookings: 0, revenue: 0 };
    propMap[title].bookings += 1;
    propMap[title].revenue += parseFloat(b.totalPrice || 0);
  });
  const topProperties = Object.entries(propMap)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([name, data], idx) => ({
      rank: idx + 1,
      name,
      revenue: `$${Math.round(data.revenue).toLocaleString()}`,
      bookings: data.bookings,
    }));

  const totalRevenue = stats?.totalRevenue || 0;
  const totalBookings = stats?.totalBookings || 0;
  const totalUsers = stats?.totalUsers || 0;
  const avgNightly = properties.length
    ? (properties.reduce((s, p) => s + parseFloat(p.pricePerNight || 0), 0) / properties.length).toFixed(0)
    : 0;

  return (
    <div className="analytics-container">
      <div className="analytics-stats-grid">
        <StatCard title="TOTAL REVENUE" value={`$${Math.round(totalRevenue).toLocaleString()}`} sub={`${totalBookings} total bookings`} icon={<DollarSign size={20} />} />
        <StatCard title="AVG NIGHTLY RATE" value={`$${avgNightly}`} sub="across approved listings" icon={<TrendingUp size={20} />} />
        <StatCard title="ACTIVE STAYS" value={stats?.activeStays ?? 0} sub="confirmed + upcoming" icon={<Percent size={20} />} />
        <StatCard title="TOTAL USERS" value={totalUsers} sub="registered accounts" icon={<Users size={20} />} />
      </div>

      {barData.length > 0 ? (
        <div className="analytics-charts-row">
          <div className="analytics-chart-box">
            <h3 className="analytics-chart-title">Revenue by Location</h3>
            <div className="analytics-chart-wrapper">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="value" fill="#c4a369" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {lineData.length > 1 && (
            <div className="analytics-chart-box">
              <h3 className="analytics-chart-title">Revenue Trend</h3>
              <div className="analytics-chart-wrapper">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#1b2533" strokeWidth={3} dot={{ r: 4, fill: '#1b2533' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="analytics-chart-box" style={{ padding: '50px', textAlign: 'center' }}>
          <p style={{ opacity: 0.5 }}>Revenue charts will appear once bookings are recorded.</p>
        </div>
      )}

      <div className="analytics-table-card">
        <h3 className="analytics-chart-title">Top Highest-Earning Properties</h3>
        {topProperties.length === 0 ? (
          <p style={{ padding: '30px', opacity: 0.5 }}>No booking data yet.</p>
        ) : (
          <div className="analytics-table-responsive">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>PROPERTY</th>
                  <th>TOTAL REVENUE</th>
                  <th>TOTAL BOOKINGS</th>
                </tr>
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
    {sub && (
      <div className="analytics-stat-trend">
        <span className="analytics-trend-sub">{sub}</span>
      </div>
    )}
  </div>
);

export default Analytics;
