import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import EmailVerification from './components/EmailVerification';
import ProtectedRoute from './components/ProtectedRoute';

// Fallback component for any missing components
function FallbackComponent({ name }) {
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">🚗 DriveNow Rentals</h1>
        <p className="text-gray-600 mb-4">Loading {name}...</p>
        <div className="space-y-2">
          <p className="text-sm text-green-600">✅ React is working!</p>
          <p className="text-sm text-blue-600">🔄 Loading {name} component...</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  // Add error handling
  React.useEffect(() => {
    console.log('App component loaded successfully');
    
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/user-dashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/verify" element={<EmailVerification />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
