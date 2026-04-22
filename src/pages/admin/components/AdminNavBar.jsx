import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import './AdminNavBar.css';

const AdminNavBar = ({ user }) => {
  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-left">
        <div className="admin-search-container">
          <Search className="admin-search-icon" size={20} />
          <input type="text" placeholder="Search..." className="admin-search-input" />
        </div>
      </div>
      <div className="admin-navbar-right">
        <Link to="/admin/notifications" className="admin-notification-link">
          <div className="admin-notification-wrapper">
            <Bell size={24} />
            <span className="admin-notification-dot"></span>
          </div>
        </Link>
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
