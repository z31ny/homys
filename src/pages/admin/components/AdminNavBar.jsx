import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { adminAPI } from '../../../services/api';
import './AdminNavBar.css';

const LAST_SEEN_KEY = 'homys_notif_last_seen';

/**
 * Admin NavBar — the bell shows how many notification items arrived since the
 * admin last opened the Notifications page. We count real events (new bookings,
 * pending reviews, new property submissions, new contact messages) whose
 * timestamp is newer than the stored "last seen" time. Opening the page (or
 * clicking the bell) records a fresh "last seen", which clears the badge.
 */
const AdminNavBar = ({ user }) => {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY) || 0);
    Promise.all([
      adminAPI.getBookings({ limit: 20 }).catch(() => ({ data: {} })),
      adminAPI.getPendingReviews().catch(() => ({ data: {} })),
      adminAPI.getProperties({ status: 'pending_review', limit: 20 }).catch(() => ({ data: {} })),
      adminAPI.getContacts({ limit: 20 }).catch(() => ({ data: {} })),
    ])
      .then(([bookingsRes, reviewsRes, propsRes, contactsRes]) => {
        const times = [
          ...(bookingsRes.data?.bookings || []),
          ...(reviewsRes.data?.reviews || []),
          ...(propsRes.data?.properties || []),
          ...(contactsRes.data?.contacts || []),
        ].map((x) => new Date(x.createdAt).getTime());
        const newCount = times.filter((t) => t && t > lastSeen).length;
        setUnread(newCount);
      })
      .catch(() => {});
  }, []);

  const handleBellClick = () => {
    localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
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
                {unread > 99 ? '99+' : unread}
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
