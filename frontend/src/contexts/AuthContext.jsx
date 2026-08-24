import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, user_type) => {
    try {
      const response = await api.post('/auth/login', { email, password, user_type });
      const { token, ...userData } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(token);
      setUser(userData);
      return { success: true, data: userData };
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.requires_otp) {
        return { 
          success: false, 
          requires_otp: true, 
          user_id: errorData.user_id,
          error: errorData.message 
        };
      }
      return { success: false, error: errorData?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, ...data } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data));
      setToken(token);
      setUser(data);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const verifyOTP = async (userId, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { user_id: userId, otp });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'OTP verification failed' };
    }
  };

  const resendOTP = async (userId) => {
    try {
      const response = await api.post('/auth/resend-otp', { user_id: userId });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to resend OTP' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    verifyOTP,
    resendOTP,
    isAuthenticated: !!token,
    isUser: user?.user_type === 'user',
    isManager: user?.user_type === 'manager',
    isAdmin: user?.user_type === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};