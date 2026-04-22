import React, { useState } from 'react';
import { 
  Calendar, 
  MessageSquare, 
  AlertCircle, 
  Settings, 
  CreditCard 
} from 'lucide-react';
import './Notifications.css';

const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Bookings', 'Messages', 'System'];

  const notificationGroups = [
    {
      label: 'Today',
      items: [
        {
          id: 1,
          type: 'Bookings',
          title: 'New Booking Confirmed',
          desc: 'Ahmed Hassan booked Beachfront Villa for 7 nights',
          time: '5 minutes ago',
          icon: <Calendar size={18} />,
          unread: true,
          highlight: true
        },
        {
          id: 2,
          type: 'Messages',
          title: 'New Message from Sara Mansour',
          desc: 'Is early check-in available?',
          time: '1 hour ago',
          icon: <MessageSquare size={18} />,
          unread: true,
          highlight: true
        },
        {
          id: 3,
          type: 'Bookings',
          title: 'Booking Cancelled',
          desc: 'Booking #BK004 has been cancelled by the guest',
          time: '3 hours ago',
          icon: <Calendar size={18} />,
          unread: false
        }
      ]
    },
    {
      label: 'Yesterday',
      items: [
        {
          id: 4,
          type: 'System',
          title: 'Payment Received',
          desc: 'Mohamed Ali completed payment for booking #BK003',
          time: 'Yesterday',
          icon: <AlertCircle size={18} />,
          unread: false
        },
        {
          id: 5,
          type: 'System',
          title: 'System Update',
          desc: 'Dashboard has been updated to version 2.1.0',
          time: 'Yesterday',
          icon: <Settings size={18} />,
          unread: false
        }
      ]
    },
    {
      label: 'Earlier',
      items: [
        {
          id: 6,
          type: 'Bookings',
          title: 'Upcoming Check-in',
          desc: 'Layla Ibrahim checking in today at Marina View',
          time: '2 days ago',
          icon: <Calendar size={18} />,
          unread: false
        },
        {
          id: 7,
          type: 'Messages',
          title: 'New Inquiry',
          desc: 'New inquiry about Red Sea Resort Chalet availability',
          time: '2 days ago',
          icon: <MessageSquare size={18} />,
          unread: false
        }
      ]
    }
  ];

  return (
    <div className="notifications-page">
      {/* Filter Tabs */}
      <div className="notif-filter-tabs">
        {filters.map(filter => (
          <button 
            key={filter}
            className={`notif-filter-btn ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Grouped Notifications */}
      <div className="notif-container">
        {notificationGroups.map(group => (
          <section key={group.label} className="notif-section">
            <h2 className="notif-section-title">{group.label}</h2>
            <div className="notif-section-card">
              {group.items
                .filter(item => activeFilter === 'All' || item.type === activeFilter)
                .map(item => (
                <div 
                  key={item.id} 
                  className={`notif-item ${item.highlight ? 'highlight' : ''}`}
                >
                  <div className="notif-icon-badge">
                    {item.icon}
                  </div>
                  <div className="notif-details">
                    <h3 className="notif-item-title">{item.title}</h3>
                    <p className="notif-item-desc">{item.desc}</p>
                    <span className="notif-item-time">{item.time}</span>
                  </div>
                  {item.unread && <span className="notif-unread-dot"></span>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

    </div>
  );
};

export default Notifications;