import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import frame125 from '../imgs/Frame 125.png';
import frame130 from '../imgs/Frame 130.png';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const navigate = useNavigate();

  const bookings = [
    { id: 1, title: 'Executive Ocean Suite', date: '12 Oct - 15 Oct, 2023', price: '$840', status: 'Completed', img: frame125 },
    { id: 2, title: 'Modern Downtown Apartment', date: '20 Jan - 22 Jan, 2024', price: '$500', status: 'Upcoming', img: frame130 }
  ];

    const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <h1 className="libre">My Sanctuary</h1>
        <p className="encode">Welcome back, Mariam. Manage your stays and personal details.</p>
      </section>

      <div className="profile-container">
        <aside className="profile-sidebar">
          <button 
            className={`sidebar-link encode ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Personal Information
          </button>
          <button 
            className={`sidebar-link encode ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Previous Bookings
          </button>
 <button className="sidebar-link encode logout" onClick={handleLogout}>
            Logout
          </button>
                  </aside>

        <main className="profile-content">
          {activeTab === 'info' ? (
            <div className="info-section animate-fade">
              <h2 className="libre">Personal Info</h2>
              <form className="profile-form">
                <div className="input-row">
                  <div className="input-group">
                    <label className="encode">Full Name</label>
                    <input type="text" defaultValue="Mariam Waleed" className="encode" />
                  </div>
                  <div className="input-group">
                    <label className="encode">Email Address</label>
                    <input type="email" defaultValue="mariam@example.com" className="encode" />
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label className="encode">Phone Number</label>
                    <input type="text" defaultValue="+20 123 456 789" className="encode" />
                  </div>
                  <div className="input-group">
                    <label className="encode">Country</label>
                    <input type="text" defaultValue="Egypt" className="encode" />
                  </div>
                </div>
                <button type="button" className="save-btn encode">Update Profile</button>
              </form>
            </div>
          ) : (
            <div className="bookings-section animate-fade">
              <h2 className="libre">My Bookings</h2>
              <div className="bookings-list">
                {bookings.map(stay => (
                  <div key={stay.id} className="booking-card">
                    <div className="booking-img">
                      <img src={stay.img} alt={stay.title} />
                    </div>
                    <div className="booking-details">
                      <h4 className="libre">{stay.title}</h4>
                      <p className="encode">{stay.date}</p>
                      <div className="booking-footer">
                        <span className="price encode">{stay.price}</span>
                        <span className={`status encode ${stay.status.toLowerCase()}`}>{stay.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;