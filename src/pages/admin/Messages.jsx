import React, { useState } from 'react';
import { Plus, Search, Send } from 'lucide-react';
import './Messages.css';

const conversations = [
  { id: 1, name: 'Ahmed Hassan', initials: 'AH', time: '10:32 AM', preview: 'Thank you for the quick response!', unread: 0, active: true },
  { id: 2, name: 'Sara Mansour', initials: 'SM', time: '9:15 AM', preview: 'Is early check-in available?', unread: 2 },
  { id: 3, name: 'Mohamed Ali', initials: 'MA', time: 'Yesterday', preview: 'The booking confirmation looks go', unread: 0 },
  { id: 4, name: 'Nour Khalil', initials: 'NK', time: 'Yesterday', preview: 'I have a question about parkin', unread: 1 },
  { id: 5, name: 'Layla Ibrahim', initials: 'LI', time: '2 days ago', preview: 'See you then!', unread: 0 },
];

const Messages = () => {
  const [search, setSearch] = useState('');
  const [activeChat, setActiveChat] = useState(conversations[0]);

  const filteredConversations = conversations.filter(chat => 
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="messages-container">
      {/* --- Left Sidebar: Conversation List --- */}
      <div className="msgs-sidebar">
        <div className="msgs-sidebar-header">
          <button className="msgs-new-btn">
            <Plus size={20} />
            <span>New Message</span>
          </button>
          <div className="msgs-search-bar">
            <Search size={18} className="msgs-search-icon" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="msgs-list">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((chat) => (
              <div 
                key={chat.id} 
                className={`msgs-item ${chat.id === activeChat.id ? 'active' : ''}`}
                onClick={() => setActiveChat(chat)}
              >
                <div className="msgs-avatar">{chat.initials}</div>
                <div className="msgs-info">
                  <div className="msgs-top-row">
                    <span className="msgs-name">{chat.name}</span>
                    <span className="msgs-time">{chat.time}</span>
                  </div>
                  <div className="msgs-bottom-row">
                    <p className="msgs-preview">{chat.preview}</p>
                    {chat.unread > 0 && <span className="msgs-unread-badge">{chat.unread}</span>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              No matches found
            </div>
          )}
        </div>
      </div>

      {/* --- Right Section: Active Chat Window --- */}
      <div className="msgs-chat-window">
        {activeChat ? (
          <>
            <div className="msgs-chat-header">
              <div className="msgs-avatar msgs-header-avatar">{activeChat.initials}</div>
              <div className="msgs-header-info">
                <h3>{activeChat.name}</h3>
                <span className="msgs-status">Active now</span>
              </div>
            </div>

            <div className="msgs-chat-body">
              <div className="msgs-bubble-row msgs-incoming">
                <div className="msgs-bubble">
                  Hello! I am interested in booking the Beachfront Villa for next weekend.
                  <span className="msgs-bubble-time">10:15 AM</span>
                </div>
              </div>

              <div className="msgs-bubble-row msgs-outgoing">
                <div className="msgs-bubble">
                  Hello Ahmed! Thank you for your interest. The Beachfront Villa is available for next weekend. Would you like to proceed with the booking?
                  <span className="msgs-bubble-time">10:18 AM</span>
                </div>
              </div>
            </div>

            <div className="msgs-input-area">
              <div className="msgs-input-wrapper">
                <input type="text" placeholder="Type your message..." />
                <button className="msgs-send-btn">
                  <Send size={18} fill="currentColor" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
