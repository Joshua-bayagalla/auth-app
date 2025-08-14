// API Configuration
export const API_BASE_URL = 'https://auth-app-xw7c.onrender.com';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/login`,
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
  DOCUMENT_EXPIRY_ALERTS: `${API_BASE_URL}/api/document-expiry-alerts`,
  UPDATE_DOCUMENT_EXPIRY: (vehicleId, docIndex) => `${API_BASE_URL}/api/vehicles/${vehicleId}/documents/${docIndex}/expiry`,
  
  // Dashboard endpoints
  DASHBOARD_STATS: `${API_BASE_URL}/api/dashboard/stats`,
  DOCUMENT_STATS: `${API_BASE_URL}/api/dashboard/document-stats`,
  
  // File uploads
  UPLOADS: `${API_BASE_URL}/uploads`,
  UPLOAD: `${API_BASE_URL}/api/upload`, // General file upload
  UPLOAD_PAYMENT_RECEIPT: `${API_BASE_URL}/api/upload-payment-receipt`,
  
  // Payment endpoints
  PAYMENTS: `${API_BASE_URL}/api/payments`,
  PAYMENT_BY_ID: (id) => `${API_BASE_URL}/api/payments/${id}`,
  CREATE_PAYMENT: `${API_BASE_URL}/api/payments`,
  UPDATE_PAYMENT: (id) => `${API_BASE_URL}/api/payments/${id}`,
  DELETE_PAYMENT: (id) => `${API_BASE_URL}/api/payments/${id}`,
};
