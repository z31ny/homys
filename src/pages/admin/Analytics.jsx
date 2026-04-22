import React from 'react';
import { 
  TrendingUp, DollarSign, BarChart3, Percent, Users, MessageSquare 
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import './Analytics.css';

// --- Static Data ---
const barData = [
  { name: 'Sahel', value: 185000 },
  { name: 'Cairo', value: 142000 },
  { name: 'Gouna', value: 98000 },
  { name: 'Red Sea', value: 125000 },
];

const pieData = [
  { name: 'Direct', value: 45, color: '#c4a369' },
  { name: 'Booking.com', value: 30, color: '#1b2533' },
  { name: 'Airbnb', value: 25, color: '#4caf82' },
];

const lineData = [
  { month: 'Jan', revenue: 380000 },
  { month: 'Feb', revenue: 410000 },
  { month: 'Mar', revenue: 440000 },
  { month: 'Apr', revenue: 470000 },
  { month: 'May', revenue: 510000 },
  { month: 'Jun', revenue: 540000 },
];

const topProperties = [
  { rank: 1, name: 'Beachfront Villa - Sahel', revenue: 'EGP 95,000', bookings: 38 },
  { rank: 2, name: 'Luxury Penthouse - Cairo', revenue: 'EGP 88,000', bookings: 28 },
  { rank: 3, name: 'Marina View - Gouna', revenue: 'EGP 76,000', bookings: 36 },
  { rank: 4, name: 'Red Sea Resort Chalet', revenue: 'EGP 72,000', bookings: 26 },
  { rank: 5, name: 'Sahel Chalet Deluxe', revenue: 'EGP 68,000', bookings: 19 },
];

const Analytics = () => {
  return (
    <div className="analytics-container">
      {/* Top Stat Cards */}
      <div className="analytics-stats-grid">
        <StatCard title="TOTAL REVENUE" value="EGP 485K" trend="+ 15.2%" icon={<DollarSign size={20}/>} />
        <StatCard title="AVG NIGHTLY RATE" value="EGP 2,450" trend="+ 5.8%" icon={<TrendingUp size={20}/>} />
        <StatCard title="AVG OCCUPANCY" value="84%" trend="+ 8.5%" icon={<Percent size={20}/>} />
        <StatCard title="NEW GUESTS" value="142" trend="+ 12.3%" icon={<Users size={20}/>} />
      </div>

      {/* Middle Row: Bar & Pie */}
      <div className="analytics-charts-row">
        <div className="analytics-chart-box">
          <h3 className="analytics-chart-title">Revenue by Location</h3>
          <div className="analytics-chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#c4a369" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-chart-box">
          <h3 className="analytics-chart-title">Booking Source</h3>
          <div className="analytics-chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} innerRadius={0} outerRadius={80} paddingAngle={0} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Trend (Full Width) */}
      <div className="analytics-chart-box full-width">
        <h3 className="analytics-chart-title">Monthly Revenue Trend</h3>
        <div className="analytics-chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Line type="monotone" dataKey="revenue" stroke="#1b2533" strokeWidth={3} dot={{r: 4, fill: '#1b2533'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Table */}
      <div className="analytics-table-card">
        <h3 className="analytics-chart-title">Top 5 Highest-Earning Properties</h3>
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
      </div>

    </div>
  );
};

const StatCard = ({ title, value, trend, icon }) => (
  <div className="analytics-stat-card">
    <div className="analytics-stat-card-header">
      <div className="analytics-stat-text">
        <span className="analytics-stat-title">{title}</span>
        <h2 className="analytics-stat-value">{value}</h2>
      </div>
      <div className="analytics-stat-icon">{icon}</div>
    </div>
    <div className="analytics-stat-trend">
      <TrendingUp size={14} className="analytics-trend-icon" />
      <span className="analytics-trend-val">{trend}</span>
      <span className="analytics-trend-sub">vs last month</span>
    </div>
  </div>
);

export default Analytics;