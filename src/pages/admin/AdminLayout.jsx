import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSideBar from './components/AdminSideBar';
import AdminNavBar from './components/AdminNavBar';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user?.isAdmin)) {
      navigate('/');
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="admin-layout">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#fff' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) return null;

  return (
    <div className="admin-layout">
      <AdminSideBar />
      <div className="admin-main-content">
        <AdminNavBar user={user} />
        <div className="admin-page-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
