import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid, Calendar, Home, Users,
  MessageSquare, BarChart3, Bell, Settings,
  Menu, X
} from 'lucide-react';
import './AdminSideBar.css';

const AdminSideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Overview', icon: <LayoutGrid size={22} />, path: '/admin' },
    { name: 'Bookings', icon: <Calendar size={22} />, path: '/admin/bookings' },
    { name: 'Properties', icon: <Home size={22} />, path: '/admin/properties' },
    { name: 'Guests', icon: <Users size={22} />, path: '/admin/guests' },
    { name: 'Messages', icon: <MessageSquare size={22} />, path: '/admin/messages' },
    { name: 'Analytics', icon: <BarChart3 size={22} />, path: '/admin/analytics' },
    { name: 'Notifications', icon: <Bell size={22} />, path: '/admin/notifications' },
    { name: 'Settings', icon: <Settings size={22} />, path: '/admin/settings' },
  ];

  return (
    <>
      <button className="admin-mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </button>

      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h1 className="admin-brand-logo">HOMYS</h1>
          <p className="admin-brand-subtext">Admin Dashboard</p>
        </div>

        <nav className="admin-sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="admin-nav-icon">{item.icon}</span>
                  <span className="admin-nav-label">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="admin-sidebar-footer">
          <NavLink to="/admin/account" className={({ isActive }) => `admin-user-profile ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            <div className="admin-avatar">AD</div>
            <div className="admin-user-info">
              <span className="admin-user-name">Admin User</span>
              <span className="admin-user-role">Super Admin</span>
            </div>
          </NavLink>
        </div>
      </aside>

      {isOpen && <div className="admin-sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default AdminSideBar;
