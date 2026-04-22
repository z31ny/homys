import React, { useState, useEffect } from 'react';
import { Calendar, Star, Home, MessageSquare } from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Notifications.css';

const iconFor = (type) => {
  if (type === 'booking') return <Calendar size={18} />;
  if (type === 'review') return <Star size={18} />;
  if (type === 'property') return <Home size={18} />;
  return <MessageSquare size={18} />;
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

const Notifications = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    Promise.all([
      adminAPI.getBookings({ limit: 10 }),
      adminAPI.getPendingReviews(),
      adminAPI.getProperties({ status: 'pending_review', limit: 10 }),
    ])
      .then(([bookingsRes, reviewsRes, propsRes]) => {
        const bookingEvents = (bookingsRes.data.bookings || []).map((b) => ({
          id: `b-${b.id}`,
          type: 'booking',
          title: `Booking — ${b.propertyTitle || 'Property'}`,
          desc: `${b.guestFirstName || ''} ${b.guestLastName || ''} · ${b.checkIn} → ${b.checkOut} · $${b.totalPrice} · ${b.status}`,
          time: b.createdAt,
          filter: 'Bookings',
        }));

        const reviewEvents = (reviewsRes.data?.reviews || []).map((r) => ({
          id: `r-${r.id}`,
          type: 'review',
          title: `Pending Review — ${r.propertyTitle || 'Property'}`,
          desc: `${r.userName || 'Guest'} left a ${r.rating}★ review awaiting approval`,
          time: r.createdAt,
          filter: 'Reviews',
        }));

        const propEvents = (propsRes.data.properties || []).map((p) => ({
          id: `p-${p.id}`,
          type: 'property',
          title: `New Property Submission`,
          desc: `${p.title} (${p.propertyType}) by ${p.ownerName || 'Owner'} — pending review`,
          time: p.createdAt,
          filter: 'Properties',
        }));

        const all = [...bookingEvents, ...reviewEvents, ...propEvents].sort(
          (a, b) => new Date(b.time) - new Date(a.time)
        );
        setEvents(all);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const filters = ['All', 'Bookings', 'Reviews', 'Properties'];
  const filtered = activeFilter === 'All' ? events : events.filter((e) => e.filter === activeFilter);

  return (
    <div className="notifications-page">
      <div className="notif-filter-tabs">
        {filters.map((f) => (
          <button
            key={f}
            className={`notif-filter-btn ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="notif-container">
        {loading ? (
          <p style={{ padding: '40px', opacity: 0.6 }}>Loading notifications...</p>
        ) : filtered.length === 0 ? (
          <div className="notif-section-card" style={{ padding: '40px', textAlign: 'center', color: '#8b8b8b' }}>
            No notifications in this category.
          </div>
        ) : (
          <section className="notif-section">
            <div className="notif-section-card">
              {filtered.map((item) => (
                <div key={item.id} className="notif-item">
                  <div className="notif-icon-badge">{iconFor(item.type)}</div>
                  <div className="notif-details">
                    <h3 className="notif-item-title">{item.title}</h3>
                    <p className="notif-item-desc">{item.desc}</p>
                    <span className="notif-item-time">{timeAgo(item.time)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Notifications;
