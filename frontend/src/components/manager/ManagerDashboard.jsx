import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { hallService, eventService } from '../../services/api';
import HallManagement from './HallManagement';
import RevenueAnalytics from './RevenueAnalytics';
import EventSchedule from './EventSchedule';
import '../../styles/Dashboard.css';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('overview');
  const [halls, setHalls] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalHalls: 0,
    bookedHalls: 0,
    availableHalls: 0,
    totalRevenue: 0,
    upcomingEvents: 0
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadData();
    
    if (socket) {
      socket.on('hall-update', handleHallUpdate);
      socket.on('event-update', handleEventUpdate);
      socket.on('booking-update', handleBookingUpdate);
      
      return () => {
        socket.off('hall-update');
        socket.off('event-update');
        socket.off('booking-update');
      };
    }
  }, [socket]);

  const loadData = async () => {
    try {
      const [hallsRes, eventsRes] = await Promise.all([
        hallService.getManagerHalls(),
        eventService.getManagerEvents()
      ]);
      
      setHalls(hallsRes.data.data);
      setEvents(eventsRes.data.data);
      calculateStats(hallsRes.data.data, eventsRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateStats = (hallsData, eventsData) => {
    const booked = hallsData.filter(h => h.status === 'booked').length;
    const available = hallsData.filter(h => h.status === 'available').length;
    const revenue = eventsData.reduce((sum, e) => sum + parseFloat(e.revenue || 0), 0);
    
    setStats({
      totalHalls: hallsData.length,
      bookedHalls: booked,
      availableHalls: available,
      totalRevenue: revenue,
      upcomingEvents: eventsData.filter(e => e.status === 'upcoming').length
    });
  };

  const handleHallUpdate = (data) => {
    setHalls(prev => prev.map(hall => {
      if (hall.hall_id === data.hall_id) {
        return { ...hall, ...data };
      }
      return hall;
    }));
    calculateStats(halls, events);
    setNotifications(prev => [...prev, {
      id: Date.now(),
      message: `🏢 Hall "${data.hall_name}" is now ${data.status}`,
      type: 'hall'
    }]);
  };

  const handleEventUpdate = (data) => {
    setEvents(prev => prev.map(event => {
      if (event.event_id === data.event_id) {
        return { ...event, ...data };
      }
      return event;
    }));
    if (data.is_live_now) {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: `🎬 "${data.title}" is now LIVE!`,
        type: 'live'
      }]);
    }
  };

  const handleBookingUpdate = (data) => {
    setNotifications(prev => [...prev, {
      id: Date.now(),
      message: `🎫 ${data.seats} tickets booked for "${data.event_title}"`,
      type: 'booking'
    }]);
    loadData();
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar manager">
        <div className="sidebar-logo">🎫 TicketBook</div>
        <div className="sidebar-user">
          <div className="user-avatar">🎬</div>
          <span className="user-name">{user?.full_name}</span>
          <span className="user-code">{user?.registration_code}</span>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`nav-item ${activeTab === 'halls' ? 'active' : ''}`}
            onClick={() => setActiveTab('halls')}
          >
            🏢 Hall Management
          </button>
          <button 
            className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            📅 Events Schedule
          </button>
          <button 
            className={`nav-item ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            💰 Revenue Analytics
          </button>
          <button className="nav-item logout" onClick={logout}>
            🚪 Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <h1>🎬 Manager Dashboard</h1>
          <div className="happy-logo-small">😊 🎫 😊</div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="notification-bar">
            {notifications.slice(-3).map(n => (
              <div key={n.id} className={`notification ${n.type}`}>
                {n.message}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="stat-card">
              <span className="stat-icon">🏢</span>
              <div className="stat-info">
                <h3>{stats.totalHalls}</h3>
                <p>Total Halls</p>
              </div>
            </div>
            <div className="stat-card booked">
              <span className="stat-icon">📅</span>
              <div className="stat-info">
                <h3>{stats.bookedHalls}</h3>
                <p>Booked Halls</p>
              </div>
            </div>
            <div className="stat-card available">
              <span className="stat-icon">✅</span>
              <div className="stat-info">
                <h3>{stats.availableHalls}</h3>
                <p>Available Halls</p>
              </div>
            </div>
            <div className="stat-card revenue">
              <span className="stat-icon">💰</span>
              <div className="stat-info">
                <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
            <div className="stat-card events">
              <span className="stat-icon">🎬</span>
              <div className="stat-info">
                <h3>{stats.upcomingEvents}</h3>
                <p>Upcoming Events</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'halls' && (
          <HallManagement halls={halls} onUpdate={loadData} />
        )}

        {activeTab === 'events' && (
          <EventSchedule events={events} onUpdate={loadData} />
        )}

        {activeTab === 'revenue' && (
          <RevenueAnalytics events={events} halls={halls} />
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;