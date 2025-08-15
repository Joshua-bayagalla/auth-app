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

  // Sign up function now hits /api/signup first, then logs in
  async function signup(email, password) {
    setLoading(true);
    try {
      const cleanEmail = (email || '').trim();
      const cleanPassword = (password || '').trim();
      console.log('Attempting signup to:', `${API_BASE_URL}/api/signup`);
      const resp = await fetch(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });

      const contentType = resp.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await resp.json();
      } else {
        const text = await resp.text();
        console.warn('Non-JSON signup response:', text?.slice(0, 200));
        if (!resp.ok) {
          throw new Error(
            resp.status >= 500
              ? 'Server is starting or temporarily unavailable. Please try again.'
              : 'Unexpected server response during signup. Please try again.'
          );
        }
        data = { message: text };
      }

      if (!resp.ok) {
        const message = data?.error || data?.detail || 'Signup failed';
        throw new Error(message);
      }

      // After successful signup, try to login immediately
      return await login(cleanEmail, cleanPassword);
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
      const cleanEmail = (email || '').trim();
      const cleanPassword = (password || '').trim();
      console.log('Attempting login to:', `${API_BASE_URL}/api/login`);
      console.log('Login data:', { email: cleanEmail });
      
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const contentType = response.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn('Non-JSON response:', text?.slice(0, 200));
        if (!response.ok) {
          // Handle common HTML error pages (e.g., 502/504/cold start)
          throw new Error(
            response.status >= 500
              ? 'Server is starting or temporarily unavailable. Please try again in a few seconds.'
              : 'Unexpected server response. Please try again.'
          );
        }
        data = {};
      }

      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data?.detail || data?.error || 'Login failed');
      }

      const user = {
        email: data.user.email,
        token: data.token || 'demo-token',
        role: data.user.role,
        verified: data.user.verified,
        uid: data.user.email,
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

  async function logout() {
    try {
      setCurrentUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

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
