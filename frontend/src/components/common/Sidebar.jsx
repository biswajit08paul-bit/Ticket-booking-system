import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, navItems }) => {
  const { user, logout } = useAuth();

  const getAvatar = () => {
    switch (user?.user_type) {
      case 'user': return '😊';
      case 'manager': return '🎬';
      case 'author': return '🏢';
      default: return '👤';
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">🎫 TicketBook</div>
      
      <div className="sidebar-user">
        <div className="user-avatar">{getAvatar()}</div>
        <span className="user-name">{user?.full_name}</span>
        {user?.registration_code && (
          <span className="user-code">{user.registration_code}</span>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon} {item.label}
          </button>
        ))}
        <button className="nav-item logout" onClick={logout}>
          🚪 Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;