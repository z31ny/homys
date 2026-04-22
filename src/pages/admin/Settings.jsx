import React, { useState } from 'react';
import { 
  Building2, Bell, Users, Palette, Plug, 
  Save, Plus, Check, Globe, Shield, MessageSquare 
} from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('General');

  const menuItems = [
    { id: 'General', icon: <Building2 size={20} /> },
    { id: 'Notifications', icon: <Bell size={20} /> },
    { id: 'Team', icon: <Users size={20} /> },
    { id: 'Appearance', icon: <Palette size={20} /> },
    { id: 'Integrations', icon: <Plug size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'General':
        return (
          <div className="settings-panel-content">
            <h2 className="settings-panel-title">General Settings</h2>
            <div className="settings-form">
              <div className="settings-field-group">
                <label>Platform Name</label>
                <input type="text" defaultValue="HOMYS" />
              </div>
              <div className="settings-field-group">
                <label>Contact Email</label>
                <input type="email" defaultValue="hello@homys.com" />
              </div>
              <div className="settings-field-group">
                <label>Support Phone</label>
                <input type="text" defaultValue="+20 123 406 789" />
              </div>
              <div className="settings-field-group">
                <label>Office Address</label>
                <input type="text" defaultValue="123 Coastal Drive, North Coast, Alexandria" />
              </div>
              <div className="settings-field-group">
                <label>Working Hours</label>
                <input type="text" defaultValue="Sat–Thu 9:00AM–6:00PM, Friday Closed" />
              </div>
              <div className="settings-field-group">
                <label>Social Links</label>
                <div className="settings-social-inputs">
                  <input type="text" placeholder="Instagram URL" />
                  <input type="text" placeholder="Facebook URL" />
                  <input type="text" placeholder="LinkedIn URL" />
                </div>
              </div>
              <button className="settings-save-btn">Save Changes</button>
            </div>
          </div>
        );

      case 'Notifications':
        return (
          <div className="settings-panel-content">
            <h2 className="settings-panel-title">Notifications</h2>
            <p className="settings-panel-desc">Configure how you receive alerts and updates.</p>
            <div className="settings-toggle-container">
              {[
                { t: "Email Notifications", d: "Receive daily reports and booking alerts." },
                { t: "SMS Alerts", d: "Get text messages for urgent guest inquiries." },
                { t: "Push Notifications", d: "Show desktop alerts for new messages." },
                { t: "System Updates", d: "Notify me about platform maintenance." }
              ].map((item, i) => (
                <div className="settings-toggle-row" key={i}>
                  <div className="settings-toggle-text">
                    <strong>{item.t}</strong>
                    <p>{item.d}</p>
                  </div>
                  <label className="settings-ios-switch">
                    <input type="checkbox" defaultChecked={i % 2 === 0} />
                    <span className="settings-slider round"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Team':
        return (
          <div className="settings-panel-content">
            <div className="settings-panel-header">
              <h2 className="settings-panel-title">Team Management</h2>
              <button className="settings-outline-btn"><Plus size={16}/> Invite Member</button>
            </div>
            <div className="settings-team-grid">
              {[
                { n: "Admin User", r: "Super Admin", s: "Active" },
                { n: "Sara Mansour", r: "Manager", s: "Active" },
                { n: "Nour Khalil", r: "Support", s: "Offline" }
              ].map((user, i) => (
                <div className="settings-member-card" key={i}>
                  <div className="settings-member-avatar">{user.n.charAt(0)}</div>
                  <div className="settings-member-info">
                    <strong>{user.n}</strong>
                    <span>{user.r}</span>
                  </div>
                  <div className={`settings-status-dot ${user.s.toLowerCase()}`}>{user.s}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Appearance':
        return (
          <div className="settings-panel-content">
            <h2 className="settings-panel-title">Appearance</h2>
            <div className="settings-appearance-grid">
              <div className="settings-section">
                <label className="settings-section-label">Theme Mode</label>
                <div className="settings-theme-options">
                  <div className="settings-theme-box active">Light</div>
                  <div className="settings-theme-box">Dark</div>
                  <div className="settings-theme-box">System</div>
                </div>
              </div>
              <div className="settings-section">
                <label className="settings-section-label">Accent Color</label>
                <div className="settings-color-swatches">
                  <div className="settings-swatch gold active"></div>
                  <div className="settings-swatch navy"></div>
                  <div className="settings-swatch green"></div>
                  <div className="settings-swatch grey"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Integrations':
        return (
          <div className="settings-panel-content">
            <h2 className="settings-panel-title">Integrations</h2>
            <p className="settings-panel-desc">Connect HOMYS with your favorite tools.</p>
            <div className="settings-int-grid">
              {[
                { name: 'Stripe', desc: 'Secure payment processing', icon: <Shield />, active: true },
                { name: 'WhatsApp', desc: 'Guest communication', icon: <MessageSquare />, active: true },
                { name: 'Google Cal', desc: 'Sync your bookings', icon: <Globe />, active: false },
                { name: 'Mailchimp', desc: 'Marketing automation', icon: <Check />, active: false }
              ].map((int, i) => (
                <div className="settings-int-card" key={i}>
                  <div className="settings-int-icon">{int.icon}</div>
                  <div className="settings-int-meta">
                    <strong>{int.name}</strong>
                    <p>{int.desc}</p>
                  </div>
                  <button className={int.active ? 'settings-int-btn connected' : 'settings-int-btn'}>
                    {int.active ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-main-container">
        {/* Sub-Sidebar Nav */}
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

        {/* Dynamic Content Panel */}
        <main className="settings-content-panel">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Settings;