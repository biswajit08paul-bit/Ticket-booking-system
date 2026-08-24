import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, verifyOTP, resendOTP } = useAuth();
  const [step, setStep] = useState('login'); // login, otp
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    user_type: 'user'
  });
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    password: '',
    confirm_password: '',
    user_type: 'user',
    company_name: '',
    address: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password, formData.user_type);
    if (result.success) {
      if (result.data.user_type === 'user') {
        navigate('/user-dashboard');
      } else if (result.data.user_type === 'manager') {
        navigate('/manager-dashboard');
      } else {
        navigate('/admin-dashboard');
      }
    } else {
      if (result.requires_otp) {
        setUserId(result.user_id);
        setStep('otp');
        setError('Please verify your email with OTP first.');
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await verifyOTP(userId, otp);
    if (result.success) {
      setStep('login');
      setError('✅ OTP verified! Please login again.');
      // Auto login after OTP verification
      const loginResult = await login(formData.email, formData.password, formData.user_type);
      if (loginResult.success) {
        if (loginResult.data.user_type === 'user') {
          navigate('/user-dashboard');
        } else if (loginResult.data.user_type === 'manager') {
          navigate('/manager-dashboard');
        } else {
          navigate('/admin-dashboard');
        }
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    const result = await resendOTP(userId);
    if (result.success) {
      setError('✅ OTP resent successfully!');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (registerData.password !== registerData.confirm_password) {
      setError('❌ Passwords do not match');
      setLoading(false);
      return;
    }

    // API call for registration
    try {
      console.log('📤 Sending registration data:', registerData);
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          full_name: registerData.full_name,
          email: registerData.email,
          phone_number: registerData.phone_number,
          date_of_birth: registerData.date_of_birth,
          password: registerData.password,
          user_type: registerData.user_type,
          company_name: registerData.company_name || undefined,
          address: registerData.address || undefined
        })
      });
    
      const data = await response.json();
      console.log('📥 Registration response:', data);
    
      if (data.success) {
        setUserId(data.data.user_id);
        setStep('otp');
        setError('✅ Registration successful! Please verify OTP sent to your email.');
        setShowRegister(false);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError('Network error. Please check if backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay"></div>
      </div>
      
      <div className="login-content">
        <div className="login-header">
          <div className="logo">🎫 TicketBook</div>
          <div className="header-buttons">
            <select 
              className="language-select"
              value={formData.user_type}
              onChange={(e) => setFormData({...formData, user_type: e.target.value})}
            >
              <option value="user">👤 User</option>
              <option value="manager">🎬 Manager</option>
              <option value="admin">🛡️ Admin</option>
            </select>
            <button 
              className="register-btn"
              onClick={() => setShowRegister(!showRegister)}
            >
              {showRegister ? 'Sign In' : 'Register'}
            </button>
          </div>
        </div>

        <div className="login-body">
          {!showRegister ? (
            <>
              <h1 className="main-title">Welcome to Our Ticket Dashboard</h1>
              <div className="happy-logo">😊 🎫 😊</div>
              <p className="sub-title">Book tickets for movies, concerts, and events effortlessly.</p>
              
              {step === 'login' ? (
                <form onSubmit={handleLogin} className="login-form">
                  <div className="form-group-login">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group-login">
                    <input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>
                  <div className="login-footer">
                    <span>Plans start at ₹149. Cancel anytime.</span>
                  </div>
                </form>
              ) : (
                <div className="otp-verification">
                  <h2>🔐 Verify Your Email</h2>
                  <p>Enter the 6-digit OTP sent to your email</p>
                  <form onSubmit={handleVerifyOTP}>
                    <div className="form-group-login">
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength="6"
                        required
                      />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="login-btn" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button 
                      type="button" 
                      className="resend-btn"
                      onClick={handleResendOTP}
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="register-form">
              <h2>Create Account</h2>
              <form onSubmit={handleRegister}>
                <div className="form-row-login">
                  <div className="form-group-login">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={registerData.full_name}
                      onChange={(e) => setRegisterData({...registerData, full_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group-login">
                    <input
                      type="email"
                      placeholder="Email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-row-login">
                  <div className="form-group-login">
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={registerData.phone_number}
                      onChange={(e) => setRegisterData({...registerData, phone_number: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group-login">
                    <input
                      type="date"
                      placeholder="Date of Birth"
                      value={registerData.date_of_birth}
                      onChange={(e) => setRegisterData({...registerData, date_of_birth: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-row-login">
                  <div className="form-group-login">
                    <input
                      type="password"
                      placeholder="Password (min 6 chars)"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group-login">
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={registerData.confirm_password}
                      onChange={(e) => setRegisterData({...registerData, confirm_password: e.target.value})}
                      required
                    />
                  </div>
                </div>
                {registerData.user_type === 'manager' && (
                  <>
                    <div className="form-group-login">
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={registerData.company_name}
                        onChange={(e) => setRegisterData({...registerData, company_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group-login">
                      <input
                        type="text"
                        placeholder="Company Address"
                        value={registerData.address}
                        onChange={(e) => setRegisterData({...registerData, address: e.target.value})}
                        required
                      />
                    </div>
                  </>
                )}
                {registerData.user_type === 'admin' && (
                  <div className="form-group-login">
                    <input
                      type="text"
                      placeholder="Address"
                      value={registerData.address}
                      onChange={(e) => setRegisterData({...registerData, address: e.target.value})}
                      required
                    />
                  </div>
                )}
                {error && <div className="error-message">{error}</div>}
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;