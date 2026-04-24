import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { adminAPI } from '../../../services/api';
import './AdminNavBar.css';

/**
 * Admin NavBar — bell shows real unread count from pending reviews +
 * pending properties. Count persists in sessionStorage and resets
 * when the admin clicks the bell (navigates to notifications).
 */
const AdminNavBar = ({ user }) => {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  // Fetch the actual pending count from the backend
  useEffect(() => {
    adminAPI.getStats()
      .then((res) => {
        const data = res.data;
        const total = (data.pendingReviews || 0) + (data.pendingProperties || 0);
        // Only bump unread if it grew since last dismissed
        const dismissed = parseInt(sessionStorage.getItem('homys_notif_dismissed') || '0', 10);
        setUnread(Math.max(0, total - dismissed));
      })
      .catch(() => {});
  }, []);

  const handleBellClick = () => {
    // Dismiss all current unread — store what we dismissed
    adminAPI.getStats().then((res) => {
      const data = res.data;
      const total = (data.pendingReviews || 0) + (data.pendingProperties || 0);
      sessionStorage.setItem('homys_notif_dismissed', String(total));
    }).catch(() => {});
    setUnread(0);
    navigate('/admin/notifications');
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-left">
        <div className="admin-search-container">
          <Search className="admin-search-icon" size={20} />
          <input type="text" placeholder="Search..." className="admin-search-input" />
        </div>
      </div>
      <div className="admin-navbar-right">
        <button className="admin-notification-link admin-bell-btn" onClick={handleBellClick} aria-label="Notifications">
          <div className="admin-notification-wrapper">
            <Bell size={24} />
            {unread > 0 && (
              <span className="admin-notification-dot">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </div>
        </button>
        <Link to="/admin/account" className="admin-nav-avatar-link">
          <div className="admin-nav-avatar">
            {user?.fullName?.substring(0, 2)?.toUpperCase() || 'AD'}
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default AdminNavBar;
