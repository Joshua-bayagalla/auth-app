import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, loading, initializing } = useAuth();

  // Show loading while checking authentication
  if (loading || initializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If role is required and user doesn't have it, redirect to appropriate dashboard
  if (requiredRole && currentUser.role !== requiredRole) {
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/user-dashboard" replace />;
    }
  }

  // If no specific role required, redirect based on user's role
  if (!requiredRole) {
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/user-dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
