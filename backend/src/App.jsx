import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/common/Header';
import WelcomeBanner from './components/common/WelcomeBanner';
import MemberRegister from './components/auth/MemberRegister';
import MemberLogin from './components/auth/MemberLogin';
import ManagerRegister from './components/auth/ManagerRegister';
import ManagerLogin from './components/auth/ManagerLogin';
import AdminRegister from './components/auth/AdminRegister';
import AdminLogin from './components/auth/AdminLogin';
import ForgotPassword from './components/auth/ForgotPassword';
import MemberDashboard from './components/dashboard/MemberDashboard';
import ManagerDashboard from './components/dashboard/ManagerDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import EventDetails from './components/events/EventDetails';
import './styles/App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="spinner"></div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.user_type)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Main Home Page
const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const [memberView, setMemberView] = useState('login');
  const [managerView, setManagerView] = useState('login');
  const [adminView, setAdminView] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (isAuthenticated) {
    if (user?.user_type === 'member') return <Navigate to="/member-dashboard" />;
    if (user?.user_type === 'manager') return <Navigate to="/manager-dashboard" />;
    if (user?.user_type === 'admin') return <Navigate to="/admin-dashboard" />;
  }

  if (showForgotPassword) {
    return (
      <div className="dashboard-container">
        <WelcomeBanner />
        <div className="main-layout">
          <div className="section-card">
            <ForgotPassword onBack={() => setShowForgotPassword(false)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <WelcomeBanner />
      
      {/* Members Section */}
      <div className="main-layout">
        <div className="section-card">
          <div className="section-title">
            <span className="icon">👤</span> Members
          </div>
          <div className="section-subtitle">
            {memberView === 'login' 
              ? 'Welcome back! Login to your account.' 
              : 'Create your account to start booking.'}
          </div>
          
          <div className="toggle-container">
            <span style={{ fontWeight: '500', color: memberView === 'login' ? '#6C3CE1' : '#718096' }}>
              Login
            </span>
            <div 
              className={`toggle-switch ${memberView === 'register' ? 'active' : ''}`}
              onClick={() => setMemberView(memberView === 'login' ? 'register' : 'login')}
            >
              <div className="toggle-knob"></div>
            </div>
            <span style={{ fontWeight: '500', color: memberView === 'register' ? '#6C3CE1' : '#718096' }}>
              Register
            </span>
          </div>
          
          {memberView === 'login' ? (
            <MemberLogin 
              onToggle={() => setMemberView('register')}
              onForgotPassword={() => setShowForgotPassword(true)}
            />
          ) : (
            <MemberRegister onToggle={() => setMemberView('login')} />
          )}
        </div>

        <div className="section-card">
          <div className="section-title">
            <span className="icon">⭐</span> Quick Actions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ 
              background: '#EDF2F7', 
              padding: '15px', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <span style={{ fontSize: '2rem' }}>🎬</span>
              <div>
                <h4 style={{ color: '#2D3748' }}>Browse Events</h4>
                <p style={{ color: '#718096', fontSize: '0.9rem' }}>Find your favorite movies and concerts</p>
              </div>
            </div>
            <div style={{ 
              background: '#EDF2F7', 
              padding: '15px', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <span style={{ fontSize: '2rem' }}>💺</span>
              <div>
                <h4 style={{ color: '#2D3748' }}>Select Seats</h4>
                <p style={{ color: '#718096', fontSize: '0.9rem' }}>Choose your preferred seating</p>
              </div>
            </div>
            <div style={{ 
              background: '#EDF2F7', 
              padding: '15px', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <span style={{ fontSize: '2rem' }}>📱</span>
              <div>
                <h4 style={{ color: '#2D3748' }}>Digital Tickets</h4>
                <p style={{ color: '#718096', fontSize: '0.9rem' }}>Get QR codes on email</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Holders Section */}
      <div className="holders-section">
        <div className="section-title" style={{ justifyContent: 'center' }}>
          <span className="icon">🔑</span> Holders Section
        </div>
        
        <div className="holders-grid">
          {/* Event Manager */}
          <div className="holder-card manager">
            <h3>🎬 Event Manager</h3>
            <p className="holder-subtitle">Manage your events and bookings</p>
            
            <div className="holder-tabs">
              <button 
                className={`holder-tab ${managerView === 'login' ? 'active' : ''}`}
                onClick={() => setManagerView('login')}
              >
                Login
              </button>
              <button 
                className={`holder-tab ${managerView === 'register' ? 'active' : ''}`}
                onClick={() => setManagerView('register')}
              >
                Register
              </button>
            </div>
            
            {managerView === 'login' ? (
              <ManagerLogin onToggle={() => setManagerView('register')} />
            ) : (
              <ManagerRegister onToggle={() => setManagerView('login')} />
            )}
          </div>

          {/* Admin */}
          <div className="holder-card admin">
            <h3>🛡️ Admin of the Board</h3>
            <p className="holder-subtitle">System administration and management</p>
            
            <div className="holder-tabs">
              <button 
                className={`holder-tab ${adminView === 'login' ? 'active' : ''}`}
                onClick={() => setAdminView('login')}
              >
                Login
              </button>
              <button 
                className={`holder-tab ${adminView === 'register' ? 'active' : ''}`}
                onClick={() => setAdminView('register')}
              >
                Register
              </button>
            </div>
            
            {adminView === 'login' ? (
              <AdminLogin onToggle={() => setAdminView('register')} />
            ) : (
              <AdminRegister onToggle={() => setAdminView('login')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App
function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Member Routes */}
          <Route path="/member-dashboard" element={
            <ProtectedRoute allowedRoles={['member']}>
              <MemberDashboard />
            </ProtectedRoute>
          } />
          
          {/* Manager Routes */}
          <Route path="/manager-dashboard" element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Event Routes */}
          <Route path="/event/:id" element={
            <ProtectedRoute allowedRoles={['member']}>
              <EventDetails />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;