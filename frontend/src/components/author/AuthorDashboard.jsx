import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { authorService } from '../../services/api';
import '../../styles/Dashboard.css';

const AuthorDashboard = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('overview');
  const [malls, setMalls] = useState([]);
  const [managers, setManagers] = useState([]);
  const [stats, setStats] = useState({
    totalMalls: 0,
    activeManagers: 0,
    totalRevenue: 0,
    bookingsThisMonth: 0
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadData();
    
    if (socket) {
      socket.on('manager-request', handleManagerRequest);
      socket.on('mall-update', handleMallUpdate);
      
      return () => {
        socket.off('manager-request');
        socket.off('mall-update');
      };
    }
  }, [socket]);

  const loadData = async () => {
    try {
      const [mallsRes, managersRes, statsRes] = await Promise.all([
        authorService.getMalls(),
        authorService.getManagers(),
        authorService.getStats()
      ]);
      setMalls(mallsRes.data.data);
      setManagers(managersRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleManagerRequest = (data) => {
    setNotifications(prev => [...prev, {
      id: Date.now(),
      message: `👤 "${data.manager_name}" requested to book ${data.hall_name}`,
      type: 'request'
    }]);
  };

  const handleMallUpdate = (data) => {
    setMalls(prev => prev.map(mall => {
      if (mall.mall_id === data.mall_id) {
        return { ...mall, ...data };
      }
      return mall;
    }));
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar author">
        <div className="sidebar-logo">🎫 TicketBook</div>
        <div className="sidebar-user">
          <div className="user-avatar">🏢</div>
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
            className={`nav-item ${activeTab === 'malls' ? 'active' : ''}`}
            onClick={() => setActiveTab('malls')}
          >
            🏢 Malls Management
          </button>
          <button 
            className={`nav-item ${activeTab === 'managers' ? 'active' : ''}`}
            onClick={() => setActiveTab('managers')}
          >
            👥 Managers
          </button>
          <button 
            className={`nav-item ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            💰 Revenue Overview
          </button>
          <button className="nav-item logout" onClick={logout}>
            🚪 Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <h1>🏢 Author/Owner Dashboard</h1>
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
                <h3>{stats.totalMalls}</h3>
                <p>Total Malls/Halls</p>
              </div>
            </div>
            <div className="stat-card managers">
              <span className="stat-icon">👥</span>
              <div className="stat-info">
                <h3>{stats.activeManagers}</h3>
                <p>Active Managers</p>
              </div>
            </div>
            <div className="stat-card revenue">
              <span className="stat-icon">💰</span>
              <div className="stat-info">
                <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
            <div className="stat-card bookings">
              <span className="stat-icon">🎫</span>
              <div className="stat-info">
                <h3>{stats.bookingsThisMonth}</h3>
                <p>Bookings This Month</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'malls' && (
          <MallManagement malls={malls} onUpdate={loadData} />
        )}

        {activeTab === 'managers' && (
          <ManagerList managers={managers} onUpdate={loadData} />
        )}

        {activeTab === 'revenue' && (
          <RevenueOverview malls={malls} managers={managers} />
        )}
      </div>
    </div>
  );
};

export default AuthorDashboard;