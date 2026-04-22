import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, MessageSquare, TrendingUp, Home, Star } from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Overview.css';

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="overview-container"><p style={{ padding: '40px', opacity: 0.6 }}>Loading dashboard...</p></div>;
  }

  const statCards = [
    { title: 'TOTAL BOOKINGS', value: stats?.totalBookings || 0, icon: <Calendar size={20} /> },
    { title: 'ACTIVE STAYS', value: stats?.activeStays || 0, icon: <Users size={20} /> },
    { title: 'TOTAL REVENUE', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <DollarSign size={20} /> },
    { title: 'TOTAL USERS', value: stats?.totalUsers || 0, icon: <Users size={20} /> },
    { title: 'PROPERTIES', value: stats?.totalProperties || 0, icon: <Home size={20} /> },
    { title: 'PENDING PROPERTIES', value: stats?.pendingProperties || 0, icon: <Home size={20} /> },
    { title: 'PENDING REVIEWS', value: stats?.pendingReviews || 0, icon: <Star size={20} /> },
    { title: 'INQUIRIES', value: stats?.totalInquiries || 0, icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="overview-container">
      <div className="overview-stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="overview-stat-card">
            <div className="overview-stat-header">
              <div className="overview-stat-info">
                <span className="overview-stat-label">{stat.title}</span>
                <h2 className="overview-stat-value">{stat.value}</h2>
              </div>
              <div className="overview-stat-icon-wrap">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;
