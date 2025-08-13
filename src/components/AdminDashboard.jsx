import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, API_BASE_URL } from '../config';
import ImageSlider from './ImageSlider';

const AdminDashboard = ({ user }) => {
  const [vehicles, setVehicles] = useState([]);
  const [rentalApplications, setRentalApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);
  const [documentExpiryAlerts, setDocumentExpiryAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('vehicles');
  
  // Vehicle form state
  const [vehicleForm, setVehicleForm] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    vin: '',
    bondAmount: '',
    rentPerWeek: '',
    currentMileage: '',
    odoMeter: '',
    nextServiceDate: '',
    vehicleType: '',
    color: '',
    fuelType: '',
    transmission: ''
  });

  // Document expiry state
  const [vehicleDocumentExpiry, setVehicleDocumentExpiry] = useState({});

  // File uploads
  const [selectedVehiclePhotos, setSelectedVehiclePhotos] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState({});

  useEffect(() => {
    fetchVehicles();
    fetchRentalApplications();
    fetchDocumentExpiryAlerts();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.VEHICLES);
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchRentalApplications = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.RENTAL_APPLICATIONS);
      const data = await response.json();
      setRentalApplications(data);
    } catch (error) {
      console.error('Error fetching rental applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentExpiryAlerts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.DOCUMENT_EXPIRY_ALERTS);
      const data = await response.json();
      setDocumentExpiryAlerts(data);
    } catch (error) {
      console.error('Error fetching document expiry alerts:', error);
    }
  };

  const handleSubmitVehicle = async (e) => {
    e.preventDefault();
    
    try {
      // Upload vehicle photos
      const photoUrls = [];
      if (selectedVehiclePhotos.length > 0) {
        for (const photo of selectedVehiclePhotos) {
          const formData = new FormData();
          formData.append('file', photo);
          
          const response = await fetch(API_ENDPOINTS.UPLOAD, {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const data = await response.json();
            photoUrls.push(data.url);
          }
        }
      }

      // Upload documents
      const documents = [];
      for (const [docType, file] of Object.entries(selectedDocuments)) {
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch(API_ENDPOINTS.UPLOAD, {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const data = await response.json();
            const expiryDate = vehicleDocumentExpiry[docType] || null;
            documents.push({
              type: docType,
              url: data.url,
              name: file.name,
              expiryDate: expiryDate
            });
          }
        }
      }

      const vehicleData = {
        ...vehicleForm,
        photoUrl: photoUrls[0] || '',
        photoUrls: photoUrls,
        documents: documents,
        requiredDocuments: [],
        status: 'available'
      };

      const response = await fetch(API_ENDPOINTS.VEHICLES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      if (response.ok) {
        setShowAddVehicleModal(false);
        setVehicleForm({
          make: '',
          model: '',
          year: '',
          licensePlate: '',
          vin: '',
          bondAmount: '',
          rentPerWeek: '',
          currentMileage: '',
          odoMeter: '',
          nextServiceDate: '',
          vehicleType: '',
          color: '',
          fuelType: '',
          transmission: ''
        });
        setSelectedVehiclePhotos([]);
        setSelectedDocuments({});
        setVehicleDocumentExpiry({});
        fetchVehicles();
        alert('Vehicle added successfully!');
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Error adding vehicle');
    }
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    
    try {
      const vehicleData = {
        ...vehicleForm,
        id: selectedVehicle.id
      };

      const response = await fetch(`${API_ENDPOINTS.VEHICLES}/${selectedVehicle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      if (response.ok) {
        setShowEditVehicleModal(false);
        setSelectedVehicle(null);
        fetchVehicles();
        alert('Vehicle updated successfully!');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Error updating vehicle');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const response = await fetch(`${API_ENDPOINTS.VEHICLES}/${vehicleId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchVehicles();
          alert('Vehicle deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Error deleting vehicle');
      }
    }
  };

  const handleRentalAction = async (applicationId, action) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.RENTAL_APPLICATIONS}/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action,
          processed_by: user.email,
          processed_at: new Date().toISOString()
        }),
      });

      if (response.ok) {
        fetchRentalApplications();
        fetchVehicles();
        alert(`Application ${action} successfully!`);
      }
    } catch (error) {
      console.error('Error processing rental application:', error);
      alert('Error processing application');
    }
  };

  const handleUpdateDocumentExpiry = async (vehicleId, docIndex, expiryDate) => {
    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_DOCUMENT_EXPIRY(vehicleId, docIndex), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiryDate }),
      });

      if (response.ok) {
        fetchDocumentExpiryAlerts();
        fetchVehicles();
        alert('Document expiry date updated successfully!');
      }
    } catch (error) {
      console.error('Error updating document expiry:', error);
      alert('Error updating document expiry');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      payment_received: { color: 'bg-blue-100 text-blue-800', text: 'Payment Received' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getAlertLevelColor = (level) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-orange-100 text-orange-800 border-orange-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      normal: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[level] || colors.normal;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage vehicles and rental applications</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vehicles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vehicles ({vehicles.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rental Applications ({rentalApplications.length})
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'alerts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Document Alerts ({documentExpiryAlerts.length})
            </button>
          </nav>
        </div>

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Vehicles</h2>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Vehicle
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200">
                    {vehicle.photoUrls && vehicle.photoUrls.length > 0 ? (
                      <ImageSlider images={vehicle.photoUrls} />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-400">No image available</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><span className="font-medium">License:</span> {vehicle.licensePlate}</p>
                      <p><span className="font-medium">Status:</span> {vehicle.status}</p>
                      <p><span className="font-medium">Rent:</span> ${vehicle.rentPerWeek}/week</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setVehicleForm(vehicle);
                          setShowEditVehicleModal(true);
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rental Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Rental Applications</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rentalApplications.map((application) => (
                <div key={application.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.first_name} {application.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{application.email}</p>
                      <p className="text-sm text-gray-600">
                        Vehicle: {application.vehicle_details?.make} {application.vehicle_details?.model}
                      </p>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">Contract Period:</span> {application.contract_period}</p>
                    <p><span className="font-medium">Phone:</span> {application.phone}</p>
                    <p><span className="font-medium">Submitted:</span> {new Date(application.submitted_at).toLocaleDateString()}</p>
                  </div>

                  {(application.status === 'pending' || application.status === 'payment_received') && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRentalAction(application.id, 'approved')}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRentalAction(application.id, 'rejected')}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {application.status === 'approved' && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✓ Approved on {new Date(application.processed_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {application.status === 'rejected' && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-800">
                        ✗ Rejected on {new Date(application.processed_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Document Expiry Alerts</h2>
            
            {documentExpiryAlerts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No document expiry alerts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documentExpiryAlerts.map((alert, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getAlertLevelColor(alert.alert_level)}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{alert.vehicle_name}</h3>
                        <p className="text-sm mt-1">{alert.document_type}</p>
                        <p className="text-sm mt-1">
                          {alert.days_until_expiry < 0 
                            ? `Expired ${Math.abs(alert.days_until_expiry)} days ago`
                            : `Expires in ${alert.days_until_expiry} days`
                          }
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="date"
                          value={alert.expiry_date ? alert.expiry_date.split('T')[0] : ''}
                          onChange={(e) => handleUpdateDocumentExpiry(alert.vehicle_id, alert.document_index, e.target.value)}
                          className="px-2 py-1 text-sm border rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Vehicle Modal */}
        {showAddVehicleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Vehicle</h2>
                  <button
                    onClick={() => setShowAddVehicleModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmitVehicle} className="space-y-6">
                  {/* Basic Vehicle Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                      <input
                        type="text"
                        required
                        value={vehicleForm.make}
                        onChange={(e) => setVehicleForm({...vehicleForm, make: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                      <input
                        type="text"
                        required
                        value={vehicleForm.model}
                        onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                      <input
                        type="text"
                        required
                        value={vehicleForm.year}
                        onChange={(e) => setVehicleForm({...vehicleForm, year: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
                      <input
                        type="text"
                        required
                        value={vehicleForm.licensePlate}
                        onChange={(e) => setVehicleForm({...vehicleForm, licensePlate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Vehicle Photos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Photos</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setSelectedVehiclePhotos(Array.from(e.target.files))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Documents */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Vehicle Documents</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['Car Contract', 'Red Book Inspection Report', 'Car Registration', 'Car Insurance', 'CPV Registration'].map((docType) => (
                        <div key={docType} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">{docType}</label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setSelectedDocuments({...selectedDocuments, [docType]: e.target.files[0]})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="date"
                            placeholder="Expiry Date"
                            onChange={(e) => setVehicleDocumentExpiry({...vehicleDocumentExpiry, [docType]: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddVehicleModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Vehicle
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Vehicle Modal */}
        {showEditVehicleModal && selectedVehicle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Vehicle</h2>
                  <button
                    onClick={() => setShowEditVehicleModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleUpdateVehicle} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                      <input
                        type="text"
                        value={vehicleForm.make}
                        onChange={(e) => setVehicleForm({...vehicleForm, make: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <input
                        type="text"
                        value={vehicleForm.model}
                        onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <input
                        type="text"
                        value={vehicleForm.year}
                        onChange={(e) => setVehicleForm({...vehicleForm, year: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                      <input
                        type="text"
                        value={vehicleForm.licensePlate}
                        onChange={(e) => setVehicleForm({...vehicleForm, licensePlate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditVehicleModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Update Vehicle
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
