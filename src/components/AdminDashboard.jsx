import React, { useState, useEffect } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config';

// Excel export function
const exportToExcel = (payments, dateRange) => {
  // Calculate summary statistics
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalBondAmount = payments.reduce((sum, p) => sum + (p.bondAmount || 0), 0);
  const totalRentAmount = payments.reduce((sum, p) => sum + (p.weeklyRent || 0), 0);
  
  // Create CSV content with summary
  const summary = [
    'PAYMENT SUMMARY REPORT',
    `Date Range: ${dateRange.startDate} to ${dateRange.endDate}`,
    `Total Payments: ${payments.length}`,
    `Total Amount: $${totalAmount.toLocaleString()}`,
    `Total Bond Amount: $${totalBondAmount.toLocaleString()}`,
    `Total Rent Amount: $${totalRentAmount.toLocaleString()}`,
    '',
    'DETAILED PAYMENT DATA',
    ''
  ];

  const headers = [
    'Customer Name',
    'Email',
    'Phone',
    'License Number',
    'Address',
    'Emergency Contact',
    'Emergency Phone',
    'Contract Period',
    'Vehicle Make',
    'Vehicle Model',
    'License Plate',
    'Payment Type',
    'Total Amount',
    'Bond Amount',
    'Weekly Rent',
    'Payment Date',
    'Status'
  ];

  const csvContent = [
    ...summary,
    headers.join(','),
    ...payments.map(payment => [
      `"${payment.customerName}"`,
      `"${payment.customerEmail}"`,
      `"${payment.customerPhone}"`,
      `"${payment.customerLicenseNumber}"`,
      `"${payment.customerAddress}"`,
      `"${payment.emergencyContact}"`,
      `"${payment.emergencyPhone}"`,
      `"${payment.contractPeriod}"`,
      `"${payment.vehicleMake}"`,
      `"${payment.vehicleModel}"`,
      `"${payment.vehicleLicensePlate}"`,
      `"${payment.paymentType}"`,
      payment.amount,
      payment.bondAmount,
      payment.weeklyRent,
      `"${new Date(payment.paymentDate).toLocaleDateString()}"`,
      `"${payment.status}"`
    ].join(','))
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `payments_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Show success message
  alert(`Excel file exported successfully!\nFilename: payments_${dateRange.startDate}_to_${dateRange.endDate}.csv\nTotal records: ${payments.length}`);
};

const AdminDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [rentalApplications, setRentalApplications] = useState([]);
  const [documentExpiryAlerts, setDocumentExpiryAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('vehicles');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [showViewVehicleModal, setShowViewVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const [showEditRentalModal, setShowEditRentalModal] = useState(false);
  const [editingRental, setEditingRental] = useState(null);
  const [editRentalForm, setEditRentalForm] = useState({});
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
    vehicleType: 'sedan',
    color: '',
    fuelType: 'petrol',
    transmission: 'automatic',
    status: 'available',
    ownerName: ''
  });
  const [editVehicleForm, setEditVehicleForm] = useState({
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
    vehicleType: 'sedan',
    color: '',
    fuelType: 'petrol',
    transmission: 'automatic',
    status: 'available',
    ownerName: ''
  });
  const [selectedVehiclePhotos, setSelectedVehiclePhotos] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState({});
  const [vehicleDocumentExpiry, setVehicleDocumentExpiry] = useState({});
  const [payments, setPayments] = useState([]);
  const [paymentDateRange, setPaymentDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filteredPayments, setFilteredPayments] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchVehicles();
    fetchRentalApplications();
    fetchDocumentExpiryAlerts();
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPaymentsByDateRange();
  }, [payments, paymentDateRange]);

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
      if (response.ok) {
        const data = await response.json();
        setRentalApplications(data);
      } else {
        console.error('Error fetching rental applications:', response.status);
        setRentalApplications([]);
      }
    } catch (error) {
      console.error('Error fetching rental applications:', error);
      setRentalApplications([]);
    }
  };

  const fetchDocumentExpiryAlerts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.DOCUMENT_EXPIRY_ALERTS);
      if (response.ok) {
        const data = await response.json();
        setDocumentExpiryAlerts(data);
      } else {
        console.error('Error fetching document expiry alerts:', response.status);
        setDocumentExpiryAlerts([]);
      }
    } catch (error) {
      console.error('Error fetching document expiry alerts:', error);
      setDocumentExpiryAlerts([]);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PAYMENTS);
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        console.error('Error fetching payments:', response.status);
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    }
  };

  const filterPaymentsByDateRange = () => {
    const filtered = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      const startDate = new Date(paymentDateRange.startDate);
      const endDate = new Date(paymentDateRange.endDate);
      endDate.setHours(23, 59, 59); // Include the entire end date
      
      return paymentDate >= startDate && paymentDate <= endDate;
    });
    setFilteredPayments(filtered);
  };

  const getPaymentStats = () => {
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPayments = filteredPayments.length;
    const totalBondAmount = filteredPayments.reduce((sum, p) => sum + (p.bondAmount || 0), 0);
    const totalRentAmount = filteredPayments.reduce((sum, p) => sum + (p.weeklyRent || 0), 0);
    
    return {
      totalAmount,
      totalPayments,
      totalBondAmount,
      totalRentAmount
    };
  };

  const handleSubmitVehicle = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      
      // Add all vehicle form fields
      Object.keys(vehicleForm).forEach(key => {
        formData.append(key, vehicleForm[key] || '');
      });
      
      // Add vehicle photo if selected
      if (selectedVehiclePhotos.length > 0) {
        formData.append('vehiclePhoto', selectedVehiclePhotos[0]);
      }

      // Add documents if selected
      Object.keys(selectedDocuments).forEach(key => {
        if (selectedDocuments[key]) {
          formData.append('documents', selectedDocuments[key]);
          formData.append(`documentType_${key}`, key);
          formData.append(`expiryDate_${key}`, vehicleDocumentExpiry[key] || '');
        }
      });

      const response = await fetch(API_ENDPOINTS.VEHICLES, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newVehicle = await response.json();
        setVehicles([...vehicles, newVehicle]);
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
          vehicleType: 'sedan',
          color: '',
          fuelType: 'petrol',
          transmission: 'automatic',
          status: 'available',
          ownerName: ''
        });
        setSelectedVehiclePhotos([]);
        setSelectedDocuments({});
        setVehicleDocumentExpiry({});
        alert('Vehicle added successfully!');
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        alert(`Error adding vehicle: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Error adding vehicle: ' + error.message);
    }
  };

  const handleApproveRental = async (applicationId) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.RENTAL_APPLICATIONS}/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'active' }),
      });

      if (response.ok) {
        fetchRentalApplications();
        fetchVehicles();
        alert('Rental application approved successfully!');
      } else {
        alert('Error approving rental application');
      }
    } catch (error) {
      console.error('Error approving rental:', error);
      alert('Error approving rental application');
    }
  };

  const handleRejectRental = async (applicationId) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.RENTAL_APPLICATIONS}/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (response.ok) {
        fetchRentalApplications();
        alert('Rental application rejected successfully!');
      } else {
        alert('Error rejecting rental application');
      }
    } catch (error) {
      console.error('Error rejecting rental:', error);
      alert('Error rejecting rental application');
    }
  };

  const handleEditRental = (application) => {
    setEditingRental(application);
    setEditRentalForm({
      firstName: application.firstName || '',
      lastName: application.lastName || '',
      email: application.email || '',
      phone: application.phone || '',
      contractPeriod: application.contractPeriod || '',
      bondAmount: application.bondAmount || '',
      weeklyRent: application.weeklyRent || '',
      status: application.status || 'pending_approval',
      notes: application.notes || ''
    });
    setShowEditRentalModal(true);
  };

  const handleUpdateRental = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_ENDPOINTS.RENTAL_APPLICATIONS}/${editingRental.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editRentalForm),
      });

      if (response.ok) {
        const result = await response.json();
        setRentalApplications(rentalApplications.map(app => 
          app.id === editingRental.id ? result.application : app
        ));
        setShowEditRentalModal(false);
        setEditingRental(null);
        setEditRentalForm({});
        alert('Rental application updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error updating rental application: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating rental application:', error);
      alert('Failed to update rental application');
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setEditVehicleForm({
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      licensePlate: vehicle.licensePlate || '',
      vin: vehicle.vin || '',
      bondAmount: vehicle.bondAmount || '',
      rentPerWeek: vehicle.rentPerWeek || '',
      currentMileage: vehicle.currentMileage || '',
      odoMeter: vehicle.odoMeter || '',
      nextServiceDate: vehicle.nextServiceDate || '',
      vehicleType: vehicle.vehicleType || 'sedan',
      color: vehicle.color || '',
      fuelType: vehicle.fuelType || 'petrol',
      transmission: vehicle.transmission || 'automatic',
      status: vehicle.status || 'available',
      ownerName: vehicle.ownerName || ''
    });
    setShowEditVehicleModal(true);
  };

  const handleViewVehicle = (vehicle) => {
    setViewingVehicle(vehicle);
    setShowViewVehicleModal(true);
  };

  const handleDeleteVehicle = async (vehicle) => {
    if (!confirm(`Are you sure you want to delete ${vehicle.make} ${vehicle.model}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.VEHICLES}/${vehicle.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVehicles(vehicles.filter(v => v.id !== vehicle.id));
        alert('Vehicle deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error deleting vehicle: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Failed to delete vehicle');
    }
  };

  const handleMarkAsMaintenance = async (vehicle) => {
    if (!confirm(`Are you sure you want to mark ${vehicle.make} ${vehicle.model} as maintenance?`)) {
      return;
    }

    try {
      const formData = new FormData();
      
      // Keep all existing vehicle data EXCEPT status
      Object.keys(vehicle).forEach(key => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'status') {
          formData.append(key, vehicle[key] || '');
        }
      });
      
      // Set the new status
      formData.append('status', 'maintenance');

      const response = await fetch(`${API_ENDPOINTS.VEHICLES}/${vehicle.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setVehicles(vehicles.map(v => v.id === vehicle.id ? result.vehicle : v));
        alert('Vehicle marked as maintenance successfully!');
      } else {
        const error = await response.json();
        alert(`Error updating vehicle: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Failed to update vehicle');
    }
  };

  const handleMarkAsAvailable = async (vehicle) => {
    if (!confirm(`Are you sure you want to mark ${vehicle.make} ${vehicle.model} as available?`)) {
      return;
    }

    try {
      const formData = new FormData();
      
      // Keep all existing vehicle data EXCEPT status
      Object.keys(vehicle).forEach(key => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'status') {
          formData.append(key, vehicle[key] || '');
        }
      });
      
      // Set the new status
      formData.append('status', 'available');

      const response = await fetch(`${API_ENDPOINTS.VEHICLES}/${vehicle.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setVehicles(vehicles.map(v => v.id === vehicle.id ? result.vehicle : v));
        alert('Vehicle marked as available successfully!');
      } else {
        const error = await response.json();
        alert(`Error updating vehicle: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Failed to update vehicle');
    }
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      
      // Add all vehicle form fields
      Object.keys(editVehicleForm).forEach(key => {
        formData.append(key, editVehicleForm[key] || '');
      });
      
      // Add vehicle photo if selected
      if (selectedVehiclePhotos.length > 0) {
        formData.append('vehiclePhoto', selectedVehiclePhotos[0]);
      }

      const response = await fetch(`${API_ENDPOINTS.VEHICLES}/${editingVehicle.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setVehicles(vehicles.map(v => v.id === editingVehicle.id ? result.vehicle : v));
        setShowEditVehicleModal(false);
        setEditingVehicle(null);
        setSelectedVehiclePhotos([]);
        alert('Vehicle updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error updating vehicle: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Failed to update vehicle');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      active: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.pending_approval;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getAlertLevelBadge = (level) => {
    const levelConfig = {
      critical: { color: 'bg-red-100 text-red-800', text: 'Critical' },
      warning: { color: 'bg-orange-100 text-orange-800', text: 'Warning' },
      info: { color: 'bg-blue-100 text-blue-800', text: 'Info' }
    };
    
    const config = levelConfig[level] || levelConfig.info;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage vehicles, rental applications, and monitor document expiry</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Simple Statistics */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Total Vehicles</p>
            <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
          </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm border">
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{vehicles.filter(v => {
                const status = Array.isArray(v.status) ? v.status[0] : v.status;
                return status === 'available';
              }).length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <p className="text-sm text-gray-600">Rented</p>
              <p className="text-2xl font-bold text-blue-600">{vehicles.filter(v => {
                const status = Array.isArray(v.status) ? v.status[0] : v.status;
                return status === 'rented';
              }).length}</p>
            </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm border">
              <p className="text-sm text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-orange-600">{vehicles.filter(v => {
                const status = Array.isArray(v.status) ? v.status[0] : v.status;
                return status === 'maintenance';
              }).length}</p>
            </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Pending Applications</p>
            <p className="text-2xl font-bold text-purple-600">{rentalApplications.filter(r => r.status === 'pending_approval').length}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vehicles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vehicles
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'maintenance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Maintenance
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rental Applications
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'alerts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Document Alerts
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payments
            </button>
          </nav>
        </div>

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Vehicle Management</h2>
                <p className="text-sm text-gray-600 mt-1">
                                     Manage all vehicles • Available: {vehicles.filter(v => {
                     const status = Array.isArray(v.status) ? v.status[0] : v.status;
                     return status === 'available';
                   }).length} • 
                   Rented: {vehicles.filter(v => {
                     const status = Array.isArray(v.status) ? v.status[0] : v.status;
                     return status === 'rented';
                   }).length} • 
                   Maintenance: {vehicles.filter(v => {
                     const status = Array.isArray(v.status) ? v.status[0] : v.status;
                     return status === 'maintenance';
                   }).length}
                </p>
              </div>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Vehicle
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bond Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weekly Rent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{vehicle.make} {vehicle.model}</div>
                            <div className="text-sm text-gray-500">{vehicle.year} • {vehicle.color}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.licensePlate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            (Array.isArray(vehicle.status) ? vehicle.status[0] : vehicle.status) === 'available' ? 'bg-green-100 text-green-800' : 
                            (Array.isArray(vehicle.status) ? vehicle.status[0] : vehicle.status) === 'rented' ? 'bg-blue-100 text-blue-800' :
                            (Array.isArray(vehicle.status) ? vehicle.status[0] : vehicle.status) === 'maintenance' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {(Array.isArray(vehicle.status) ? vehicle.status[0] : vehicle.status) === 'available' ? 'Available' : 
                             (Array.isArray(vehicle.status) ? vehicle.status[0] : vehicle.status) === 'rented' ? 'Rented' :
                             (Array.isArray(vehicle.status) ? vehicle.status[0] : vehicle.status) === 'maintenance' ? 'Maintenance' : (Array.isArray(vehicle.status) ? vehicle.status[0] : vehicle.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${vehicle.bondAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${vehicle.rentPerWeek}/week</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewVehicle(vehicle)}
                              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEditVehicle(vehicle)}
                              className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-xs"
                            >
                              Edit
                            </button>
                            {(Array.isArray(vehicle.status) ? vehicle.status[0] : vehicle.status) !== 'maintenance' && (
                              <button
                                onClick={() => handleMarkAsMaintenance(vehicle)}
                                className="px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-xs"
                              >
                                Maintenance
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteVehicle(vehicle)}
                              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Vehicle Maintenance</h2>
                <p className="text-sm text-gray-600 mt-1">Manage vehicles currently under repair or service</p>
              </div>
              <button
                onClick={fetchVehicles}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Refresh
              </button>
            </div>

            {/* Maintenance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-600">In Maintenance</p>
                                         <p className="text-2xl font-bold text-orange-900">{vehicles.filter(v => {
                       const status = Array.isArray(v.status) ? v.status[0] : v.status;
                       return status === 'maintenance';
                     }).length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Service Due Soon</p>
                    <p className="text-2xl font-bold text-blue-900">
                                             {vehicles.filter(v => {
                         const status = Array.isArray(v.status) ? v.status[0] : v.status;
                         return status === 'maintenance' && v.nextServiceDate && new Date(v.nextServiceDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                       }).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Ready to Return</p>
                    <p className="text-2xl font-bold text-green-900">
                                             {vehicles.filter(v => {
                         const status = Array.isArray(v.status) ? v.status[0] : v.status;
                         return status === 'maintenance' && v.nextServiceDate && new Date(v.nextServiceDate) > new Date();
                       }).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
                          {vehicles.filter(vehicle => {
                const status = Array.isArray(vehicle.status) ? vehicle.status[0] : vehicle.status;
                return status === 'maintenance';
              }).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Vehicles Operational</h3>
                <p className="text-gray-500">No vehicles are currently in maintenance</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Maintenance Vehicles</h3>
                  <p className="text-sm text-gray-600 mt-1">Vehicles currently under repair or service</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Information</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vehicles.filter(vehicle => {
                      // Handle both string and array status values
                      const status = Array.isArray(vehicle.status) ? vehicle.status[0] : vehicle.status;
                      return status === 'maintenance';
                    }).map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{vehicle.make} {vehicle.model}</div>
                              <div className="text-sm text-gray-500">{vehicle.year} • {vehicle.color}</div>
                              <div className="text-sm text-gray-500 mt-1">License: {vehicle.licensePlate}</div>
                              <div className="text-sm text-gray-500">Mileage: {vehicle.currentMileage} km</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  Under Maintenance
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Next Service:</span> {vehicle.nextServiceDate ? new Date(vehicle.nextServiceDate).toLocaleDateString() : 'Not scheduled'}
                              </div>
                              {vehicle.nextServiceDate && new Date(vehicle.nextServiceDate) <= new Date() && (
                                <div className="text-sm text-red-600 font-medium">
                                  ⚠️ Service overdue
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => handleViewVehicle(vehicle)}
                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleEditVehicle(vehicle)}
                                className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-xs"
                              >
                                Edit Vehicle
                              </button>
                              <button
                                onClick={() => handleMarkAsAvailable(vehicle)}
                                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-xs"
                              >
                                Mark as Available
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rental Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Rental Applications</h2>
              <button
                onClick={fetchRentalApplications}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Refresh
              </button>
            </div>
            
            {rentalApplications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                <p className="text-gray-500">No rental applications found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rentalApplications.map((application) => (
                  <div key={application.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.firstName} {application.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{application.email}</p>
                        <p className="text-sm text-gray-600">Phone: {application.phone}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(application.status)}
                        {application.vehicle_details && (
                          <span className="text-sm text-gray-600">
                            {application.vehicle_details.make} {application.vehicle_details.model}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Contract Period:</span> {application.contractPeriod}
                      </div>
                      <div>
                        <span className="font-medium">Bond Amount:</span> ${application.bondAmount}
                      </div>
                      <div>
                        <span className="font-medium">Weekly Rent:</span> ${application.weeklyRent}
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span> {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Car Photos Display */}
                    {application.carPhotosUrls && application.carPhotosUrls.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Car Photos:</h4>
                        <div className="flex flex-wrap gap-2">
                          {application.carPhotosUrls.map((photoUrl, index) => (
                            <div key={index} className="relative">
                              <img
                                src={photoUrl}
                                alt={`Car photo ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <a
                                href={photoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all rounded-lg"
                                title="Click to view full size"
                              >
                                <svg className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditRental(application)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      {application.status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => handleApproveRental(application.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRental(application.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Document Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Document Expiry Alerts</h2>
                <p className="text-sm text-gray-600 mt-1">Monitor vehicle documents that are expiring soon</p>
              </div>
              <button
                onClick={fetchDocumentExpiryAlerts}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Refresh
              </button>
            </div>
            
            {documentExpiryAlerts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Documents Up to Date</h3>
                <p className="text-gray-500">No documents are expiring soon</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Group alerts by vehicle */}
                {(() => {
                  const vehicleGroups = {};
                  documentExpiryAlerts.forEach(alert => {
                    if (!vehicleGroups[alert.vehicle_name]) {
                      vehicleGroups[alert.vehicle_name] = [];
                    }
                    vehicleGroups[alert.vehicle_name].push(alert);
                  });

                  return Object.entries(vehicleGroups).map(([vehicleName, alerts]) => {
                    const criticalCount = alerts.filter(a => a.alert_level === 'critical').length;
                    const warningCount = alerts.filter(a => a.alert_level === 'warning').length;
                    const infoCount = alerts.filter(a => a.alert_level === 'info').length;
                    
                    // Determine overall alert level for the vehicle
                    let overallLevel = 'info';
                    let overallColor = 'blue';
                    if (criticalCount > 0) {
                      overallLevel = 'critical';
                      overallColor = 'red';
                    } else if (warningCount > 0) {
                      overallLevel = 'warning';
                      overallColor = 'orange';
                    }

                    return (
                      <div key={vehicleName} className={`bg-${overallColor}-50 border border-${overallColor}-200 rounded-lg p-6`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className={`text-xl font-semibold text-${overallColor}-900`}>{vehicleName}</h3>
                            <p className={`text-sm text-${overallColor}-700 mt-1`}>
                              {alerts.length} document{alerts.length > 1 ? 's' : ''} requiring attention
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {criticalCount > 0 && (
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                {criticalCount} Expired
                              </span>
                            )}
                            {warningCount > 0 && (
                              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                {warningCount} Expiring Soon
                              </span>
                            )}
                            {infoCount > 0 && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {infoCount} Upcoming
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {alerts.map((alert, index) => {
                            const alertColors = {
                              critical: 'red',
                              warning: 'orange',
                              info: 'blue'
                            };
                            const color = alertColors[alert.alert_level];
                            
                            return (
                              <div key={index} className={`bg-white border border-${color}-200 rounded-lg p-4`}>
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className={`text-lg font-semibold text-${color}-900`}>
                                      {alert.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </h4>
                                    <p className={`text-sm text-${color}-600 mt-1`}>
                                      {alert.alert_level === 'critical' ? 'Expired on:' : 'Expires on:'} {new Date(alert.expiry_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-3 py-1 bg-${color}-100 text-${color}-800 rounded-full text-sm font-medium`}>
                                      {alert.alert_level === 'critical' ? 'EXPIRED' : 
                                       alert.alert_level === 'warning' ? 'EXPIRING SOON' : 'UPCOMING'}
                                    </span>
                                    <span className={`text-sm font-medium text-${color}-600`}>
                                      {alert.alert_level === 'critical' 
                                        ? `${Math.abs(alert.days_until_expiry)} days overdue`
                                        : `${alert.days_until_expiry} days left`
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Payment Tracking</h2>
                <p className="text-sm text-gray-600 mt-1">Monitor all payments received with date range filtering</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => exportToExcel(filteredPayments, paymentDateRange)}
                  disabled={filteredPayments.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                  title={`Export ${filteredPayments.length} payment records from ${paymentDateRange.startDate} to ${paymentDateRange.endDate}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export to Excel</span>
                </button>
                <button
                  onClick={fetchPayments}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Filter by Date Range</h3>
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={paymentDateRange.startDate}
                    onChange={(e) => setPaymentDateRange({...paymentDateRange, startDate: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={paymentDateRange.endDate}
                    onChange={(e) => setPaymentDateRange({...paymentDateRange, endDate: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setPaymentDateRange({
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0]
                  })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => setPaymentDateRange({
                    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0]
                  })}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Last 7 Days
                </button>
              </div>
            </div>

            {/* Payment Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-blue-600">{getPaymentStats().totalPayments}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">${getPaymentStats().totalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <p className="text-sm text-gray-600">Total Bond Amount</p>
                <p className="text-2xl font-bold text-purple-600">${getPaymentStats().totalBondAmount.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <p className="text-sm text-gray-600">Total Rent Amount</p>
                <p className="text-2xl font-bold text-orange-600">${getPaymentStats().totalRentAmount.toLocaleString()}</p>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
                <p className="text-sm text-gray-600 mt-1">Showing {filteredPayments.length} payments in selected date range</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <p className="text-lg font-medium text-gray-900 mb-2">No Payments Found</p>
                          <p className="text-gray-500">No payments match the selected date range</p>
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                              <div className="text-xs text-gray-500">
                                <div>📧 {payment.customerEmail}</div>
                                <div>📞 {payment.customerPhone}</div>
                                <div>🚗 License: {payment.customerLicenseNumber}</div>
                                <div>📍 {payment.customerAddress}</div>
                                <div>🆘 Emergency: {payment.emergencyContact} ({payment.emergencyPhone})</div>
                                <div>📅 Contract: {payment.contractPeriod}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{payment.vehicleMake} {payment.vehicleModel}</div>
                            <div className="text-sm text-gray-500">{payment.vehicleLicensePlate}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Rental Payment
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              Bond: ${payment.bondAmount} | Rent: ${payment.weeklyRent}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">${payment.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            {payment.receiptUrl && (
                              <a
                                href={payment.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                                title="Click to view receipt in new tab"
                              >
                                View Receipt
                              </a>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add Vehicle Modal */}
        {showAddVehicleModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Vehicle</h3>
                  <button
                    onClick={() => setShowAddVehicleModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmitVehicle} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Make</label>
                      <input
                        type="text"
                        value={vehicleForm.make}
                        onChange={(e) => setVehicleForm({...vehicleForm, make: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Toyota"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Model</label>
                      <input
                        type="text"
                        value={vehicleForm.model}
                        onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Camry"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Year</label>
                      <input
                        type="text"
                        value={vehicleForm.year}
                        onChange={(e) => setVehicleForm({...vehicleForm, year: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 2023"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">License Plate</label>
                      <input
                        type="text"
                        value={vehicleForm.licensePlate}
                        onChange={(e) => setVehicleForm({...vehicleForm, licensePlate: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., ABC123"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">VIN</label>
                      <input
                        type="text"
                        value={vehicleForm.vin}
                        onChange={(e) => setVehicleForm({...vehicleForm, vin: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 1HGBH41JXMN109186"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Color</label>
                      <input
                        type="text"
                        value={vehicleForm.color}
                        onChange={(e) => setVehicleForm({...vehicleForm, color: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Red"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bond Amount ($)</label>
                      <input
                        type="number"
                        value={vehicleForm.bondAmount}
                        onChange={(e) => setVehicleForm({...vehicleForm, bondAmount: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 1000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weekly Rent ($)</label>
                      <input
                        type="number"
                        value={vehicleForm.rentPerWeek}
                        onChange={(e) => setVehicleForm({...vehicleForm, rentPerWeek: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Mileage</label>
                      <input
                        type="number"
                        value={vehicleForm.currentMileage}
                        onChange={(e) => setVehicleForm({...vehicleForm, currentMileage: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 50000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                      <select
                        value={vehicleForm.vehicleType}
                        onChange={(e) => setVehicleForm({...vehicleForm, vehicleType: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="hatchback">Hatchback</option>
                        <option value="wagon">Wagon</option>
                        <option value="convertible">Convertible</option>
                        <option value="minivan">Minivan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                      <select
                        value={vehicleForm.fuelType}
                        onChange={(e) => setVehicleForm({...vehicleForm, fuelType: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="electric">Electric</option>
                        <option value="gasoline">Gasoline</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transmission</label>
                      <select
                        value={vehicleForm.transmission}
                        onChange={(e) => setVehicleForm({...vehicleForm, transmission: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedVehiclePhotos(e.target.files)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">Upload vehicle photo (JPG, PNG, WEBP)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle Documents</label>
                    <div className="mt-2 space-y-2">
                      {['car_contract', 'red_book_inspection_report', 'car_registration', 'car_insurance', 'cpv_registration'].map((docType) => (
                        <div key={docType} className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setSelectedDocuments({...selectedDocuments, [docType]: e.target.files[0]})}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="date"
                            placeholder="Expiry Date"
                            onChange={(e) => setVehicleDocumentExpiry({...vehicleDocumentExpiry, [docType]: e.target.value})}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="text-sm text-gray-600 w-32">{docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Upload vehicle documents (PDF, DOC, DOCX)</p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddVehicleModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
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
        {showEditVehicleModal && editingVehicle && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Vehicle</h3>
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
                      <label className="block text-sm font-medium text-gray-700">Make</label>
                      <input
                        type="text"
                        value={editVehicleForm.make}
                        onChange={(e) => setEditVehicleForm({...editVehicleForm, make: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Toyota"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Model</label>
                      <input
                        type="text"
                        value={editVehicleForm.model}
                        onChange={(e) => setEditVehicleForm({...editVehicleForm, model: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Camry"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Year</label>
                      <input
                        type="text"
                        value={editVehicleForm.year}
                        onChange={(e) => setEditVehicleForm({...editVehicleForm, year: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 2023"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">License Plate</label>
                      <input
                        type="text"
                        value={editVehicleForm.licensePlate}
                        onChange={(e) => setEditVehicleForm({...editVehicleForm, licensePlate: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., ABC123"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">VIN</label>
                      <input
                        type="text"
                        value={editVehicleForm.vin}
                        onChange={(e) => setEditVehicleForm({...editVehicleForm, vin: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 1HGBH41JXMN109186"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Color</label>
                      <input
                        type="text"
                        value={editVehicleForm.color}
                        onChange={(e) => setEditVehicleForm({...editVehicleForm, color: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Red"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bond Amount ($)</label>
                      <input
                        type="number"
                        value={editVehicleForm.bondAmount}
                        onChange={(e) => setEditVehicleForm({...editVehicleForm, bondAmount: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 1000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weekly Rent ($)</label>
                      <input
                        type="number"
                        value={editVehicleForm.rentPerWeek}
                        onChange={(e) => setEditVehicleForm({...editVehicleForm, rentPerWeek: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 200"
                        required
                      />
                    </div>
                                         <div>
                       <label className="block text-sm font-medium text-gray-700">Current Mileage</label>
                       <input
                         type="number"
                         value={editVehicleForm.currentMileage}
                         onChange={(e) => setEditVehicleForm({...editVehicleForm, currentMileage: e.target.value})}
                         className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                         placeholder="e.g., 50000"
                         required
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Odometer</label>
                       <input
                         type="number"
                         value={editVehicleForm.odoMeter}
                         onChange={(e) => setEditVehicleForm({...editVehicleForm, odoMeter: e.target.value})}
                         className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                         placeholder="e.g., 50000"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Next Service Date</label>
                       <input
                         type="date"
                         value={editVehicleForm.nextServiceDate}
                         onChange={(e) => setEditVehicleForm({...editVehicleForm, nextServiceDate: e.target.value})}
                         className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Status</label>
                       <select
                         value={editVehicleForm.status}
                         onChange={(e) => setEditVehicleForm({...editVehicleForm, status: e.target.value})}
                         className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                         required
                       >
                         <option value="available">Available</option>
                         <option value="rented">Rented</option>
                         <option value="maintenance">Maintenance</option>
                       </select>
                       <p className="mt-1 text-xs text-gray-500">
                         Available: Can be rented | Rented: Currently rented | Maintenance: Under repair/service
                       </p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                       <input
                         type="text"
                         value={editVehicleForm.ownerName}
                         onChange={(e) => setEditVehicleForm({...editVehicleForm, ownerName: e.target.value})}
                         className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                         placeholder="e.g., John Doe"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                       <select
                         value={editVehicleForm.vehicleType}
                         onChange={(e) => setEditVehicleForm({...editVehicleForm, vehicleType: e.target.value})}
                         className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                         required
                       >
                         <option value="sedan">Sedan</option>
                         <option value="suv">SUV</option>
                         <option value="hatchback">Hatchback</option>
                         <option value="wagon">Wagon</option>
                         <option value="convertible">Convertible</option>
                         <option value="minivan">Minivan</option>
                       </select>
                     </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                      <select
                        value={editVehicleForm.fuelType}
                        onChange={(e) => setEditVehicleForm({...editVehicleForm, fuelType: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="electric">Electric</option>
                        <option value="gasoline">Gasoline</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transmission</label>
                      <select
                        value={editVehicleForm.transmission}
                        onChange={(e) => setEditVehicleForm({...editVehicleForm, transmission: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedVehiclePhotos(e.target.files)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">Upload vehicle photo (JPG, PNG, WEBP)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle Documents</label>
                    <div className="mt-2 space-y-2">
                      {['car_contract', 'red_book_inspection_report', 'car_registration', 'car_insurance', 'cpv_registration'].map((docType) => (
                        <div key={docType} className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setSelectedDocuments({...selectedDocuments, [docType]: e.target.files[0]})}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="date"
                            placeholder="Expiry Date"
                            onChange={(e) => setVehicleDocumentExpiry({...vehicleDocumentExpiry, [docType]: e.target.value})}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="text-sm text-gray-600 w-32">{docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Upload vehicle documents (PDF, DOC, DOCX)</p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditVehicleModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
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

         {/* View Vehicle Modal */}
         {showViewVehicleModal && viewingVehicle && (
           <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
             <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
               <div className="mt-3">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-medium text-gray-900">Vehicle Details</h3>
                   <button
                     onClick={() => setShowViewVehicleModal(false)}
                     className="text-gray-400 hover:text-gray-600"
                   >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 </div>
                 
                 <div className="space-y-4">
                   {/* Vehicle Photo */}
                   {viewingVehicle.photoUrl && (
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Photo</label>
                       <img 
                         src={viewingVehicle.photoUrl} 
                         alt={`${viewingVehicle.make} ${viewingVehicle.model}`}
                         className="w-full h-48 object-cover rounded-lg border"
                       />
                     </div>
                   )}

                   {/* Basic Information */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Make</label>
                       <p className="mt-1 text-sm text-gray-900">{viewingVehicle.make}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Model</label>
                       <p className="mt-1 text-sm text-gray-900">{viewingVehicle.model}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Year</label>
                       <p className="mt-1 text-sm text-gray-900">{viewingVehicle.year}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">License Plate</label>
                       <p className="mt-1 text-sm text-gray-900">{viewingVehicle.licensePlate}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">VIN</label>
                       <p className="mt-1 text-sm text-gray-900">{viewingVehicle.vin}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Color</label>
                       <p className="mt-1 text-sm text-gray-900">{viewingVehicle.color}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                       <p className="mt-1 text-sm text-gray-900">{viewingVehicle.vehicleType}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                       <p className="mt-1 text-sm text-gray-900">{viewingVehicle.fuelType}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Transmission</label>
                       <p className="mt-1 text-sm text-gray-900">{viewingVehicle.transmission}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Status</label>
                       <p className="mt-1 text-sm text-gray-900">
                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                           viewingVehicle.status === 'available' ? 'bg-green-100 text-green-800' : 
                           viewingVehicle.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                           viewingVehicle.status === 'maintenance' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                         }`}>
                           {viewingVehicle.status === 'available' ? 'Available' : 
                            viewingVehicle.status === 'rented' ? 'Rented' :
                            viewingVehicle.status === 'maintenance' ? 'Maintenance' : viewingVehicle.status}
                         </span>
                       </p>
                     </div>
                   </div>

                   {/* Financial Information */}
                   <div className="border-t pt-4">
                     <h4 className="text-md font-medium text-gray-900 mb-3">Financial Information</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div>
                         <label className="block text-sm font-medium text-gray-700">Bond Amount</label>
                         <p className="mt-1 text-sm text-gray-900">${viewingVehicle.bondAmount}</p>
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700">Weekly Rent</label>
                         <p className="mt-1 text-sm text-gray-900">${viewingVehicle.rentPerWeek}/week</p>
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-gray-700">Current Mileage</label>
                         <p className="mt-1 text-sm text-gray-900">{viewingVehicle.currentMileage} km</p>
                       </div>
                     </div>
                   </div>

                   {/* Documents */}
                   {viewingVehicle.documents && viewingVehicle.documents.length > 0 && (
                     <div className="border-t pt-4">
                       <h4 className="text-md font-medium text-gray-900 mb-3">Vehicle Documents</h4>
                       <div className="space-y-2">
                         {viewingVehicle.documents.map((doc, index) => (
                           <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                             <div>
                               <p className="text-sm font-medium text-gray-900">
                                 {doc.documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                               </p>
                               <p className="text-xs text-gray-600">{doc.fileName}</p>
                               {doc.expiryDate && (
                                 <p className="text-xs text-gray-600">Expires: {new Date(doc.expiryDate).toLocaleDateString()}</p>
                               )}
                             </div>
                             <a
                               href={doc.fileUrl}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs"
                             >
                               Download
                             </a>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Timestamps */}
                   <div className="border-t pt-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                       <div>
                         <span className="font-medium">Created:</span> {new Date(viewingVehicle.createdAt).toLocaleString()}
                       </div>
                       <div>
                         <span className="font-medium">Last Updated:</span> {new Date(viewingVehicle.updatedAt).toLocaleString()}
                       </div>
                     </div>
                   </div>

                   <div className="flex justify-end pt-4">
                     <button
                       onClick={() => setShowViewVehicleModal(false)}
                       className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                     >
                       Close
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         )}

        {/* Edit Rental Application Modal */}
        {showEditRentalModal && editingRental && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Rental Application</h3>
                  <button
                    onClick={() => setShowEditRentalModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleUpdateRental} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        value={editRentalForm.firstName}
                        onChange={(e) => setEditRentalForm({...editRentalForm, firstName: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        value={editRentalForm.lastName}
                        onChange={(e) => setEditRentalForm({...editRentalForm, lastName: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={editRentalForm.email}
                        onChange={(e) => setEditRentalForm({...editRentalForm, email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={editRentalForm.phone}
                        onChange={(e) => setEditRentalForm({...editRentalForm, phone: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contract Period</label>
                      <input
                        type="text"
                        value={editRentalForm.contractPeriod}
                        onChange={(e) => setEditRentalForm({...editRentalForm, contractPeriod: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 6 months"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bond Amount ($)</label>
                      <input
                        type="number"
                        value={editRentalForm.bondAmount}
                        onChange={(e) => setEditRentalForm({...editRentalForm, bondAmount: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weekly Rent ($)</label>
                      <input
                        type="number"
                        value={editRentalForm.weeklyRent}
                        onChange={(e) => setEditRentalForm({...editRentalForm, weeklyRent: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={editRentalForm.status}
                        onChange={(e) => setEditRentalForm({...editRentalForm, status: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending_approval">Pending Approval</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      value={editRentalForm.notes}
                      onChange={(e) => setEditRentalForm({...editRentalForm, notes: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Additional notes about this rental application..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditRentalModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Update Application
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
