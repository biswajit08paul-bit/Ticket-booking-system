import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import MoviePosters from './MoviePosters';
import SeatSelection from './SeatSelection';
import BookingHistory from './BookingHistory';
import LiveEventBanner from './LiveEventBanner';
import '../../styles/Dashboard.css';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { socket, joinEvent, leaveEvent } = useSocket();
  const [activeTab, setActiveTab] = useState('movies');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.on('live-event-update', (data) => {
        setLiveEvents(prev => [...prev, data]);
        setNotifications(prev => [...prev, {
          id: Date.now(),
          message: `🎬 ${data.title} is now LIVE!`,
          type: 'live'
        }]);
      });

      socket.on('seat-update', (data) => {
        // Update seat availability in real-time
        setSelectedEvent(prev => {
          if (prev && prev.event_id === data.event_id) {
            return { ...prev, available_seats: data.available_seats };
          }
          return prev;
        });
      });

      return () => {
        socket.off('live-event-update');
        socket.off('seat-update');
      };
    }
  }, [socket]);

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    joinEvent(event.event_id);
    setActiveTab('seats');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">🎫 TicketBook</div>
        <div className="sidebar-user">
          <div className="user-avatar">😊</div>
          <span className="user-name">{user?.full_name}</span>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            🎬 Movies & Events
          </button>
          <button 
            className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            📋 My Bookings
          </button>
          <button 
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📊 Transaction History
          </button>
          <button className="nav-item logout" onClick={logout}>
            🚪 Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Live Events Banner */}
        <LiveEventBanner liveEvents={liveEvents} />

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="notification-bar">
            {notifications.map(n => (
              <div key={n.id} className={`notification ${n.type}`}>
                {n.message}
              </div>
            ))}
          </div>
        )}

        <div className="content-header">
          <h1>🎫 Welcome to Our Ticket Dashboard</h1>
          <div className="happy-logo-small"> 🎫 </div>
        </div>

        {activeTab === 'movies' && (
          <MoviePosters onEventSelect={handleEventSelect} />
        )}

        {activeTab === 'seats' && selectedEvent && (
          <SeatSelection 
            event={selectedEvent} 
            onBack={() => {
              setActiveTab('movies');
              leaveEvent(selectedEvent.event_id);
              setSelectedEvent(null);
            }}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingHistory />
        )}

        {activeTab === 'history' && (
          <TransactionHistory />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;