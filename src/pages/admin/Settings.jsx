import React, { useState } from 'react';
import { Building2, Users, Plug, Check, Globe, Shield, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

/**
 * Settings page — only shows tabs that have actual functionality.
 *
 * REMOVED: Appearance (no theme system), Notifications (no notification backend).
 *
 * General     — read-only platform info (no settings DB table exists; editing here
 *               would need a new backend table, which is out of current scope).
 *               Displayed as reference info only.
 * Team        — links to the Guests admin page where real user data lives.
 * Integrations — shows the real services wired into the platform and their status.
 */
const Settings = () => {
  const [activeTab, setActiveTab] = useState('General');
  const navigate = useNavigate();

  const menuItems = [
    { id: 'General',      icon: <Building2 size={20} /> },
    { id: 'Team',         icon: <Users size={20} /> },
    { id: 'Integrations', icon: <Plug size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {

      case 'General':
        return (
          <div className="settings-panel-content">
            <h2 className="settings-panel-title">Platform Information</h2>
            <p className="settings-panel-desc" style={{ marginBottom: 24 }}>
              This is the current contact and operational info for the Homys platform.
              To update these details, change them directly in your codebase or contact page content.
            </p>
            <div className="settings-form">
              {[
                { label: 'Platform Name',  value: 'HOMYS' },
                { label: 'Support Email',  value: 'hello@homys.com' },
                { label: 'Support Phone',  value: '+20 123 456 789' },
                { label: 'Office Address', value: '123 Coastal Drive, North Coast, Alexandria' },
                { label: 'Working Hours',  value: 'Sat–Thu 9:00 AM – 6:00 PM  ·  Friday Closed' },
              ].map(({ label, value }) => (
                <div className="settings-field-group" key={label}>
                  <label>{label}</label>
                  <input
                    type="text"
                    defaultValue={value}
                    readOnly
                    style={{ opacity: 0.7, cursor: 'default', background: '#f5f2ec' }}
                  />
                </div>
              ))}
              <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: 8 }}>
                A platform settings table is not yet implemented. These values are display-only.
              </p>
            </div>
          </div>
        );

      case 'Team':
        return (
          <div className="settings-panel-content">
            <h2 className="settings-panel-title">Team Management</h2>
            <p className="settings-panel-desc">
              All registered users and their roles are managed in the{' '}
              <strong>Guests</strong> section. To grant or revoke admin access,
              update the <code>is_admin</code> flag directly in your Neon database:
            </p>
            <div
              style={{
                background: '#1b2533',
                color: '#c4a369',
                padding: '16px 20px',
                borderRadius: 10,
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                margin: '20px 0',
                lineHeight: 1.7,
              }}
            >
              {'-- Grant admin access'}
              <br />
              {"UPDATE users SET is_admin = true WHERE email = 'user@email.com';"}
              <br />
              <br />
              {'-- Revoke admin access'}
              <br />
              {"UPDATE users SET is_admin = false WHERE email = 'user@email.com';"}
            </div>
            <button
              className="settings-save-btn"
              onClick={() => navigate('/admin/guests')}
              style={{ marginTop: 8 }}
            >
              Go to Guests Page
            </button>
          </div>
        );

      case 'Integrations':
        return (
          <div className="settings-panel-content">
            <h2 className="settings-panel-title">Active Integrations</h2>
            <p className="settings-panel-desc">
              All third-party services currently wired into the Homys platform.
            </p>
            <div className="settings-int-grid">
              {[
                {
                  name: 'Cloudinary',
                  desc: 'Property image hosting, CDN delivery, and auto-format (WebP/AVIF). Cloud: dzpswgjsm.',
                  icon: <Check />,
                  active: true,
                },
                {
                  name: 'Resend',
                  desc: 'Transactional email for password reset. Awaiting custom domain verification for full send capability.',
                  icon: <MessageSquare />,
                  active: true,
                  warning: true,
                },
                {
                  name: 'Neon DB',
                  desc: 'PostgreSQL serverless database via Drizzle ORM. 11 tables, fully migrated.',
                  icon: <Shield />,
                  active: true,
                },
                {
                  name: 'Vercel',
                  desc: 'Frontend and backend (serverless functions) deployment. Live at homys-eta.vercel.app.',
                  icon: <Globe />,
                  active: true,
                },
                {
                  name: 'Paymob',
                  desc: 'Payment gateway integration. Awaiting API keys from stakeholders.',
                  icon: <Globe />,
                  active: false,
                },
              ].map((int) => (
                <div className="settings-int-card" key={int.name}>
                  <div className="settings-int-icon">{int.icon}</div>
                  <div className="settings-int-meta">
                    <strong>{int.name}</strong>
                    <p>{int.desc}</p>
                  </div>
                  <button
                    className={`settings-int-btn ${int.active ? 'connected' : ''}`}
                    style={
                      int.warning
                        ? { borderColor: '#f9a825', color: '#f9a825' }
                        : {}
                    }
                  >
                    {int.active ? (int.warning ? 'Partial' : 'Active') : 'Pending'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-main-container">
        <nav className="settings-subnav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`settings-subnav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.id}</span>
            </button>
          ))}
        </nav>

        <main className="settings-content-panel">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Settings;
