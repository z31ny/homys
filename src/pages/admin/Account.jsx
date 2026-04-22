import React, { useState } from 'react';
import { 
  Camera, Mail, Phone, MapPin, Shield, 
  Key, Globe, LogOut, CheckCircle, User
} from 'lucide-react';
import './Account.css';

const Account = () => {
  const [activeTab, setActiveTab] = useState('Personal');

  return (
    <div className="profile-container">
      {/* Hero / Cover Section */}
      <div className="profile-hero">
        <div className="cover-photo"></div>
        <div className="profile-header-main">
          <div className="avatar-wrapper">
            <div className="main-avatar">AD</div>
            <button className="edit-avatar-btn">
              <Camera size={18} />
            </button>
          </div>
          <div className="user-intro">
            <h1 className="profile-name">Admin User</h1>
            <p className="profile-role">Super Admin • Joined Jan 2024</p>
          </div>
          <div className="profile-actions">
            <button className="btn-secondary">View Public Profile</button>
            <button className="btn-primary">Save Changes</button>
          </div>
        </div>
      </div>

      <div className="profile-content-grid">
        {/* Left Sidebar: Quick Stats/Menu */}
        <aside className="profile-sidebar">
          <div className="profile-nav-card">
            <button 
              className={`nav-btn ${activeTab === 'Personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('Personal')}
            >
              <User size={20} /> Personal Info
            </button>
            <button 
              className={`nav-btn ${activeTab === 'Security' ? 'active' : ''}`}
              onClick={() => setActiveTab('Security')}
            >
              <Shield size={20} /> Security
            </button>
            <hr className="nav-divider" />
            <button className="nav-btn logout-btn">
              <LogOut size={20} /> Sign Out
            </button>
          </div>

          <div className="status-card">
            <h3>Account Status</h3>
            <div className="status-item">
              <CheckCircle size={16} color="var(--color-gold)" />
              <span>Identity Verified</span>
            </div>
            <div className="status-item">
              <CheckCircle size={16} color="var(--color-gold)" />
              <span>2FA Enabled</span>
            </div>
          </div>
        </aside>

        {/* Right Section: Forms */}
        <main className="profile-main-form">
          {activeTab === 'Personal' ? (
            <div className="form-section">
              <h2 className="section-title">Personal Information</h2>
              <div className="form-grid">
                <div className="input-box">
                  <label>Full Name</label>
                  <input type="text" defaultValue="Admin User" />
                </div>
                <div className="input-box">
                  <label>Title / Role</label>
                  <input type="text" defaultValue="Super Admin" />
                </div>
                <div className="input-box">
                  <label><Mail size={14}/> Email Address</label>
                  <input type="email" defaultValue="admin@homys.com" />
                </div>
                <div className="input-box">
                  <label><Phone size={14}/> Phone Number</label>
                  <input type="text" defaultValue="+20 123 456 789" />
                </div>
                <div className="input-box full-width">
                  <label><MapPin size={14}/> Location</label>
                  <input type="text" defaultValue="Alexandria, Egypt" />
                </div>
                <div className="input-box full-width">
                  <label>Short Bio</label>
                  <textarea rows="4" defaultValue="Managing luxury properties across the North Coast with a focus on high-end guest experiences."></textarea>
                </div>
              </div>
            </div>
          ) : (
            <div className="form-section">
              <h2 className="section-title">Security Settings</h2>
              <div className="security-list">
                <div className="security-item">
                  <div className="sec-info">
                    <strong>Change Password</strong>
                    <p>Last updated 3 months ago</p>
                  </div>
                  <button className="btn-outline">Update</button>
                </div>
                <div className="security-item">
                  <div className="sec-info">
                    <strong>Two-Factor Authentication</strong>
                    <p>Add an extra layer of security to your account.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="security-item">
                  <div className="sec-info">
                    <strong>Connected Devices</strong>
                    <p>You are currently logged in on 2 devices.</p>
                  </div>
                  <button className="btn-outline">Manage</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Account;