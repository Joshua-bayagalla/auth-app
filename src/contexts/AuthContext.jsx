import { createContext, useContext, useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

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
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      const user = {
        email: data.user_email,
        token: data.token,
        uid: data.user_email, // Using email as uid for now
      };

      setCurrentUser(user);
      localStorage.setItem('authToken', data.token);
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
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
