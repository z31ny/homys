import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './Messages.css';

/**
 * Messages page — shows real contact form submissions saved to the DB.
 * A real-time messaging system (WebSocket/third-party) is outside the current scope.
 * This surfaces every inquiry submitted via the Contact Us page so the admin
 * can see what users asked and reply to them by email.
 */
const Messages = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminAPI.getContacts({ limit: 50 })
      .then((res) => {
        const contacts = res.data.contacts || [];
        setSubmissions(contacts);
        if (contacts.length) setActive(contacts[0]);
      })
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = submissions.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.message || '').toLowerCase().includes(q)
    );
  });

  const initials = (name) =>
    (name || 'U')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0)
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="messages-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ opacity: 0.6 }}>Loading messages...</p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div
        className="messages-container"
        style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}
      >
        <h3 style={{ color: '#112a3d' }}>No contact inquiries yet</h3>
        <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>
          Submissions from the Contact Us form will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="messages-container">
      {/* ── Sidebar ── */}
      <div className="msgs-sidebar">
        <div className="msgs-sidebar-header">
          <div className="msgs-search-bar">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ flexShrink: 0, opacity: 0.5 }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="msgs-list">
          {filtered.length === 0 ? (
            <p style={{ padding: '20px', opacity: 0.5, fontSize: '0.85rem' }}>No results</p>
          ) : (
            filtered.map((s) => (
              <div
                key={s.id}
                className={`msgs-item ${active?.id === s.id ? 'active' : ''}`}
                onClick={() => setActive(s)}
              >
                <div className="msgs-avatar">{initials(s.name)}</div>
                <div className="msgs-info">
                  <div className="msgs-top-row">
                    <span className="msgs-name">{s.name}</span>
                    <span className="msgs-time">{formatTime(s.createdAt)}</span>
                  </div>
                  <div className="msgs-bottom-row">
                    <p className="msgs-preview">
                      {(s.message || '').slice(0, 42)}
                      {s.message?.length > 42 ? '…' : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Chat window ── */}
      <div className="msgs-chat-window">
        {active ? (
          <>
            <div className="msgs-chat-header">
              <div className="msgs-avatar msgs-header-avatar">{initials(active.name)}</div>
              <div className="msgs-header-info">
                <h3>{active.name}</h3>
                <span className="msgs-status">
                  {active.email}
                  {active.phone ? ` · ${active.phone}` : ''}
                </span>
              </div>
            </div>

            <div className="msgs-chat-body">
              <div className="msgs-bubble-row msgs-incoming">
                <div className="msgs-bubble">
                  {active.message}
                  <span className="msgs-bubble-time">{formatTime(active.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="msgs-input-area">
              <p style={{ padding: '16px 20px', opacity: 0.5, fontSize: '0.85rem', fontStyle: 'italic' }}>
                Reply to this inquiry by emailing{' '}
                <a href={`mailto:${active.email}`} style={{ color: '#c4a369', fontWeight: 700 }}>
                  {active.email}
                </a>
              </p>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
            }}
          >
            Select a message to view
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
