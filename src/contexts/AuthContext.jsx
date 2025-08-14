import { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Sign up function (using simple endpoint for now)
  async function signup(email, password) {
    setLoading(true);
    try {
      // For now, just log the user in directly since we have a simple login endpoint
      return await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Login function
  async function login(email, password) {
    setLoading(true);
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/api/login`);
      console.log('Login data:', { email, password });
      
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Login failed');
      }

      const user = {
        email: data.user.email,
        token: data.token || 'demo-token', // Backend doesn't return token yet
        role: data.user.role,
        verified: data.user.verified,
        uid: data.user.email, // Using email as uid for now
      };

      setCurrentUser(user);
      localStorage.setItem('authToken', user.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Logout function
  async function logout() {
    try {
      // For now, just clear local storage since we don't have a logout endpoint
      setCurrentUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setInitializing(false);
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading,
    initializing
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
