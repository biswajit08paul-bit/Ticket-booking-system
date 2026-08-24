import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <span className="logo-icon">🎫</span>
          <span className="logo-text">TicketBook</span>
        </Link>

        <div className="header-right">
          {isAuthenticated ? (
            <>
              <span className="user-greeting">
                👋 {user?.full_name}
                <span className="user-role-badge">{user?.user_type}</span>
              </span>
              <button className="btn-logout" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <button className="btn-login" onClick={() => navigate('/login')}>
              Login / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;