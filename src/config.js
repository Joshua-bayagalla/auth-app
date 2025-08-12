// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/login`,
  SIGNUP: `${API_BASE_URL}/api/signup`,
  VERIFY_EMAIL: `${API_BASE_URL}/api/verify-email`,
  RESEND_VERIFICATION: `${API_BASE_URL}/api/resend-verification`,
  
            // Vehicle endpoints
          VEHICLES: `${API_BASE_URL}/api/vehicles`,
          VEHICLE_BY_ID: (id) => `${API_BASE_URL}/api/vehicles/${id}`,
          CREATE_VEHICLE: `${API_BASE_URL}/api/vehicles`,
          UPDATE_VEHICLE: (id) => `${API_BASE_URL}/api/vehicles/${id}`,
          DELETE_VEHICLE: (id) => `${API_BASE_URL}/api/vehicles/${id}`,
  
            // Driver endpoints
          DRIVERS: `${API_BASE_URL}/api/drivers`,
          DRIVER_BY_ID: (id) => `${API_BASE_URL}/api/drivers/${id}`,
          CREATE_DRIVER: `${API_BASE_URL}/api/drivers`,
          UPDATE_DRIVER: (id) => `${API_BASE_URL}/api/drivers/${id}`,
          DELETE_DRIVER: (id) => `${API_BASE_URL}/api/drivers/${id}`,
          DRIVER_DOCUMENTS: (driverId) => `${API_BASE_URL}/api/drivers/${driverId}/documents`,
  
  // Rental endpoints
  RENTALS: `${API_BASE_URL}/api/rentals`,
  RENTAL_APPLICATIONS: `${API_BASE_URL}/api/rental-applications`,
  RENTAL_APPLICATION_BY_ID: (id) => `${API_BASE_URL}/api/rental-applications/${id}`,
  
  // Document endpoints
  DOCUMENT_TYPES: `${API_BASE_URL}/api/document-types`,
  DOWNLOAD_DOCUMENT: (driverId, docId) => `${API_BASE_URL}/api/documents/${driverId}/${docId}/download`,
  
  // Dashboard endpoints
  DASHBOARD_STATS: `${API_BASE_URL}/api/dashboard/stats`,
  
  // File uploads
  UPLOADS: `${API_BASE_URL}/uploads`,
};
