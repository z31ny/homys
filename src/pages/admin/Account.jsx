import React, { useState } from 'react';
import { Camera, Mail, Phone, MapPin, Shield, LogOut, CheckCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Account.css';

const Account = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Personal');

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [country, setCountry] = useState(user?.country || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await updateProfile({ fullName, phone, country });
      setSaveMsg('Profile updated successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = (name) =>
    (name || 'AD')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="profile-container">
      <div className="profile-hero">
        <div className="cover-photo"></div>
        <div className="profile-header-main">
          <div className="avatar-wrapper">
            <div className="main-avatar">{initials(user?.fullName)}</div>
          </div>
          <div className="user-intro">
            <h1 className="profile-name">{user?.fullName || 'Admin'}</h1>
            <p className="profile-role">Super Admin · {user?.email}</p>
          </div>
          <div className="profile-actions">
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="profile-content-grid">
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
            <button className="nav-btn logout-btn" onClick={handleLogout}>
              <LogOut size={20} /> Sign Out
            </button>
          </div>

          <div className="status-card">
            <h3>Account Status</h3>
            <div className="status-item">
              <CheckCircle size={16} color="var(--color-gold)" />
              <span>Admin Verified</span>
            </div>
            <div className="status-item">
              <CheckCircle size={16} color="var(--color-gold)" />
              <span>Account Active</span>
            </div>
          </div>
        </aside>

        <main className="profile-main-form">
          {activeTab === 'Personal' ? (
            <div className="form-section">
              <h2 className="section-title">Personal Information</h2>
              {saveMsg && (
                <p style={{ color: saveMsg.includes('success') ? '#2e7d32' : '#c0392b', fontWeight: 700, marginBottom: 16, fontSize: '0.9rem' }}>
                  {saveMsg}
                </p>
              )}
              <div className="form-grid">
                <div className="input-box">
                  <label>Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="input-box">
                  <label>Role</label>
                  <input type="text" value="Super Admin" disabled style={{ opacity: 0.5 }} />
                </div>
                <div className="input-box">
                  <label><Mail size={14} /> Email Address</label>
                  <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
                </div>
                <div className="input-box">
                  <label><Phone size={14} /> Phone Number</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+20 123 456 789" />
                </div>
                <div className="input-box full-width">
                  <label><MapPin size={14} /> Country</label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Egypt" />
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
                    <p>Use the Forgot Password flow on the login page to reset your password securely.</p>
                  </div>
                  <button className="btn-outline" onClick={() => { logout(); navigate('/forget-password'); }}>
                    Reset Password
                  </button>
                </div>
                <div className="security-item">
                  <div className="sec-info">
                    <strong>Admin Privileges</strong>
                    <p>Your account has full admin access to the Homys platform.</p>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#4caf82', fontWeight: 700 }}>✓ Active</span>
                </div>
                <div className="security-item">
                  <div className="sec-info">
                    <strong>Sign Out Everywhere</strong>
                    <p>Log out of your current session immediately.</p>
                  </div>
                  <button className="btn-outline" onClick={handleLogout}>Sign Out</button>
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
