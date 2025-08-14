import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, API_BASE_URL } from '../config';
import ImageSlider from './ImageSlider';
import { useAuth } from '../contexts/AuthContext';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  // Fallback to localStorage if AuthContext is not working
  const user = currentUser || JSON.parse(localStorage.getItem('user') || 'null');
  
  // Debug logging
  console.log('=== USER DASHBOARD DEBUG ===');
  console.log('currentUser from AuthContext:', currentUser);
  console.log('user variable:', user);
  console.log('localStorage user:', localStorage.getItem('user'));
  const [vehicles, setVehicles] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [selectedPaymentReceipt, setSelectedPaymentReceipt] = useState(null);
  const [selectedCarPhotos, setSelectedCarPhotos] = useState([]);
  const [activeTab, setActiveTab] = useState('vehicles');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('all'); // 'all', 'make', 'model', 'license'
  const [rentalForm, setRentalForm] = useState({
    contract_period: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    license_number: '',
    license_expiry: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    payment_amount: ''
  });

  useEffect(() => {
    fetchVehicles();
    fetchUserBookings();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.VEHICLES);
      const data = await response.json();
      setVehicles(data.filter(vehicle => vehicle.status === 'available'));
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.RENTAL_APPLICATIONS);
      const data = await response.json();
      
      console.log('=== DEBUGGING USER BOOKINGS ===');
      console.log('Current user object:', user);
      console.log('User email:', user?.email);
      console.log('All rental applications:', data.length);
      console.log('All applications:', data.map(app => ({ email: app.email, status: app.status, vehicle: app.vehicle_details?.make + ' ' + app.vehicle_details?.model })));
      
      if (user && user.email) {
        // Only show approved/active rentals in bookings
        const userBookings = data.filter(booking => 
          booking.email === user.email && booking.status === 'active'
        );
        console.log('Filtered bookings for user:', userBookings.length);
        console.log('User bookings:', userBookings.map(booking => ({ email: booking.email, status: booking.status, vehicle: booking.vehicle_details?.make + ' ' + booking.vehicle_details?.model })));
        setUserBookings(userBookings);
      } else {
        console.log('No user or user email found');
        setUserBookings([]);
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      setUserBookings([]);
    }
  };

  // Search and filter functions
  const filteredBookings = userBookings.filter(booking => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const vehicle = booking.vehicle_details;
    
    switch (searchFilter) {
      case 'make':
        return vehicle?.make?.toLowerCase().includes(searchLower);
      case 'model':
        return vehicle?.model?.toLowerCase().includes(searchLower);
      case 'license':
        return vehicle?.licensePlate?.toLowerCase().includes(searchLower);
      case 'all':
      default:
        return (
          vehicle?.make?.toLowerCase().includes(searchLower) ||
          vehicle?.model?.toLowerCase().includes(searchLower) ||
          vehicle?.licensePlate?.toLowerCase().includes(searchLower) ||
          vehicle?.color?.toLowerCase().includes(searchLower)
        );
    }
  });

  const getBookingStats = () => {
    const totalBookings = userBookings.length;
    const activeBookings = userBookings.filter(booking => booking.status === 'active').length;
    const totalValue = userBookings.reduce((sum, booking) => sum + (booking.weeklyRent || 0), 0);
    
    return { totalBookings, activeBookings, totalValue };
  };

  const handleRentalSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['contract_period', 'first_name', 'last_name', 'email', 'phone', 'license_number', 'license_expiry', 'address', 'emergency_contact', 'emergency_phone', 'payment_amount'];
    const missingFields = requiredFields.filter(field => !rentalForm[field] || rentalForm[field].trim() === '');
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    if (selectedCarPhotos.length === 0) {
      alert('Please upload at least one photo of your current car');
      return;
    }
    
    // Validate payment amount
    const requiredAmount = (selectedVehicle?.bondAmount || 0) + (selectedVehicle?.rentPerWeek || 0);
    const paidAmount = parseFloat(rentalForm.payment_amount);
    
    if (isNaN(paidAmount) || paidAmount < requiredAmount) {
      alert(`Please enter a valid payment amount. Minimum required: $${requiredAmount}`);
      return;
    }
    
    if (!selectedPaymentReceipt) {
      alert('Please select a payment receipt');
      return;
    }
    
    try {
      // Create FormData for rental application with file upload
      const formData = new FormData();
      
      // Map frontend field names to backend field names
      formData.append('vehicleId', selectedVehicle.id);
      formData.append('contractPeriod', rentalForm.contract_period);
      formData.append('firstName', rentalForm.first_name);
      formData.append('lastName', rentalForm.last_name);
      formData.append('email', rentalForm.email);
      formData.append('phone', rentalForm.phone);
      formData.append('licenseNumber', rentalForm.license_number);
      formData.append('licenseExpiry', rentalForm.license_expiry);
      formData.append('address', rentalForm.address);
      formData.append('emergencyContact', rentalForm.emergency_contact);
      formData.append('emergencyPhone', rentalForm.emergency_phone);
      formData.append('contractSigned', 'true');
      formData.append('bondAmount', selectedVehicle.bondAmount || 0);
      formData.append('weeklyRent', selectedVehicle.rentPerWeek || 0);
      formData.append('paymentAmount', rentalForm.payment_amount);
      
      // Add car photos
      selectedCarPhotos.forEach((photo, index) => {
        formData.append('carPhotos', photo);
      });
      
      // Add payment receipt file
      formData.append('paymentReceipt', selectedPaymentReceipt);
      
      // Submit rental application
      const rentalResponse = await fetch(API_ENDPOINTS.RENTALS, {
        method: 'POST',
        body: formData, // Send as FormData, not JSON
      });

      if (rentalResponse.ok) {
        const rentalData = await rentalResponse.json();

        setShowRentalModal(false);
        setSelectedVehicle(null);
        setSelectedPaymentReceipt(null);
        setSelectedCarPhotos([]);
        setRentalForm({
          contract_period: '',
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          license_number: '',
          license_expiry: '',
          address: '',
          emergency_contact: '',
          emergency_phone: '',
          payment_amount: ''
        });
        
        // Refresh data
        fetchVehicles();
        fetchUserBookings();
        alert('Rental application submitted successfully!');
      } else {
        const errorData = await rentalResponse.json();
        console.error('Server error:', errorData);
        alert(`Error submitting rental application: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting rental:', error);
      alert('Error submitting rental application: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Approval' },
      payment_received: { color: 'bg-blue-100 text-blue-800', text: 'Payment Received' },
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.pending_approval;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { status: 'unknown', color: 'text-gray-500' };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-red-600' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring_soon', color: 'text-orange-600' };
    } else {
      return { status: 'valid', color: 'text-green-600' };
    }
  };

  const handleDownloadDocument = (document) => {
    const url = `${API_BASE_URL}${document.fileUrl}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName || user?.email || 'User'}!</h1>
              <p className="mt-2 text-gray-600">Find cars to rent and manage your bookings</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                window.location.href = '/';
              }}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* Simple Navigation */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'vehicles'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              🚗 Find Cars to Rent
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'bookings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              📋 My Bookings ({userBookings.length})
            </button>
          </div>
        </div>



        {/* Available Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200">
                  {vehicle.photoUrl ? (
                    <img 
                      src={`${API_BASE_URL}${vehicle.photoUrl}`} 
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : vehicle.photoUrls && vehicle.photoUrls.length > 0 ? (
                    <ImageSlider images={vehicle.photoUrls.map(url => url.startsWith('http') ? url : `${API_BASE_URL}${url}`)} />
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
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Year:</span> {vehicle.year}</p>
                    <p><span className="font-medium">License Plate:</span> {vehicle.licensePlate}</p>
                    <p><span className="font-medium">Type:</span> {vehicle.vehicleType}</p>
                    <p><span className="font-medium">Color:</span> {vehicle.color}</p>
                    <p><span className="font-medium">Rent per Week:</span> ${vehicle.rentPerWeek}</p>
                    <p><span className="font-medium">Bond Amount:</span> ${vehicle.bondAmount}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setShowVehicleModal(true);
                      }}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setShowRentalModal(true);
                      }}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Rent Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Simple Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
                  <p className="text-sm text-gray-600 mt-1">Your rented vehicles</p>
                </div>
                <button
                  onClick={fetchUserBookings}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
              
              {/* Simple Search */}
              <div className="mt-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by car make, model, or license plate..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            {userBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="text-6xl mb-4">🚗</div>
                <p className="text-gray-500 text-lg font-medium">No rented cars yet</p>
                <p className="text-sm text-gray-400 mt-2">Find a car to rent from the available vehicles</p>
                <button 
                  onClick={() => setActiveTab('vehicles')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Find Cars to Rent
                </button>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg font-medium">No cars match your search</p>
                <p className="text-sm text-gray-400 mt-2">Try different search terms</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.vehicle_details?.make} {booking.vehicle_details?.model}
                        </h3>
                        <p className="text-sm text-gray-600">License: {booking.vehicle_details?.licensePlate}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><span className="font-medium">Rent:</span> ${booking.weeklyRent}/week</p>
                      <p><span className="font-medium">Bond:</span> ${booking.bondAmount}</p>
                      <p><span className="font-medium">Period:</span> {booking.contractPeriod}</p>
                      <p><span className="font-medium">Start Date:</span> {new Date(booking.contractStartDate).toLocaleDateString()}</p>
                    </div>

                    {/* Documents Section */}
                    {booking.vehicle_details && booking.vehicle_details.documents && booking.vehicle_details.documents.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                          📄 Vehicle Documents ({booking.vehicle_details.documents.length})
                        </h4>
                        <div className="space-y-1">
                          {booking.vehicle_details.documents.slice(0, 3).map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                              <span className="text-sm text-gray-700">
                                {doc.documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              <button
                                onClick={() => handleDownloadDocument(doc)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Download
                              </button>
                            </div>
                          ))}
                          {booking.vehicle_details.documents.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{booking.vehicle_details.documents.length - 3} more documents
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedVehicle(booking.vehicle_details);
                        setShowVehicleModal(true);
                      }}
                      className="mt-4 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vehicle Details Modal */}
        {showVehicleModal && selectedVehicle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </h2>
                  <button
                    onClick={() => setShowVehicleModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="h-64 bg-gray-200 rounded-lg mb-4">
                      {selectedVehicle.photoUrl ? (
                        <img 
                          src={`${API_BASE_URL}${selectedVehicle.photoUrl}`} 
                          alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : selectedVehicle.photoUrls && selectedVehicle.photoUrls.length > 0 ? (
                        <ImageSlider images={selectedVehicle.photoUrls.map(url => url.startsWith('http') ? url : `${API_BASE_URL}${url}`)} />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-gray-400">No image available</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Year:</span>
                        <p className="text-gray-900">{selectedVehicle.year}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">License Plate:</span>
                        <p className="text-gray-900">{selectedVehicle.licensePlate}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">VIN:</span>
                        <p className="text-gray-900">{selectedVehicle.vin}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <p className="text-gray-900">{selectedVehicle.vehicleType}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Color:</span>
                        <p className="text-gray-900">{selectedVehicle.color}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Fuel Type:</span>
                        <p className="text-gray-900">{selectedVehicle.fuelType}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Transmission:</span>
                        <p className="text-gray-900">{selectedVehicle.transmission}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Current Mileage:</span>
                        <p className="text-gray-900">{selectedVehicle.currentMileage} km</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Odometer:</span>
                        <p className="text-gray-900">{selectedVehicle.odoMeter} km</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Next Service:</span>
                        <p className="text-gray-900">{selectedVehicle.nextServiceDate}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">${selectedVehicle.rentPerWeek}</p>
                          <p className="text-sm text-gray-600">Per Week</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">${selectedVehicle.bondAmount}</p>
                          <p className="text-sm text-gray-600">Bond Amount</p>
                        </div>
                      </div>
                    </div>

                    {/* Documents Section */}
                    {selectedVehicle.documents && selectedVehicle.documents.length > 0 && (
                      <div className="border-t pt-4">
                        <h3 className="font-medium text-gray-900 mb-3">Vehicle Documents</h3>
                        <div className="space-y-2">
                          {selectedVehicle.documents.map((doc, index) => {
                            const expiryStatus = getExpiryStatus(doc.expiryDate);
                            return (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-sm font-medium">{doc.type}</span>
                                  {doc.expiryDate && (
                                    <span className={`ml-2 text-xs ${expiryStatus.color}`}>
                                      (Expires: {new Date(doc.expiryDate).toLocaleDateString()})
                                    </span>
                                  )}
                                </div>
                                <a
                                  href={`${API_BASE_URL}${doc.url}`}
                                  download
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  Download
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowVehicleModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rental Application Modal */}
        {showRentalModal && selectedVehicle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Rent Vehicle</h2>
                  <button
                    onClick={() => setShowRentalModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </h3>
                  <p className="text-sm text-gray-600">License: {selectedVehicle.licensePlate}</p>
                  <p className="text-sm text-gray-600">Rent: ${selectedVehicle.rentPerWeek}/week</p>
                  <p className="text-sm text-gray-600">Bond: ${selectedVehicle.bondAmount}</p>
                </div>

                <form onSubmit={handleRentalSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contract Period *
                      </label>
                      <select
                        required
                        value={rentalForm.contract_period}
                        onChange={(e) => setRentalForm({...rentalForm, contract_period: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select period</option>
                        <option value="1 week">1 Week</option>
                        <option value="2 weeks">2 Weeks</option>
                        <option value="1 month">1 Month</option>
                        <option value="3 months">3 Months</option>
                        <option value="6 months">6 Months</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={rentalForm.first_name}
                        onChange={(e) => setRentalForm({...rentalForm, first_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={rentalForm.last_name}
                        onChange={(e) => setRentalForm({...rentalForm, last_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={rentalForm.email}
                        onChange={(e) => setRentalForm({...rentalForm, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={rentalForm.phone}
                        onChange={(e) => setRentalForm({...rentalForm, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={rentalForm.license_number}
                        onChange={(e) => setRentalForm({...rentalForm, license_number: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Expiry *
                      </label>
                      <input
                        type="date"
                        required
                        value={rentalForm.license_expiry}
                        onChange={(e) => setRentalForm({...rentalForm, license_expiry: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      required
                      value={rentalForm.address}
                      onChange={(e) => setRentalForm({...rentalForm, address: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        value={rentalForm.emergency_contact}
                        onChange={(e) => setRentalForm({...rentalForm, emergency_contact: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={rentalForm.emergency_phone}
                        onChange={(e) => setRentalForm({...rentalForm, emergency_phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Car Photos *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setSelectedCarPhotos(Array.from(e.target.files))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload photos of your current car (required). You can select multiple photos.
                    </p>
                    {selectedCarPhotos.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-green-600">
                          {selectedCarPhotos.length} photo(s) selected
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedCarPhotos.map((photo, index) => (
                            <div key={index} className="text-xs text-gray-600">
                              {photo.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bank Details Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-blue-900 mb-3">Payment Information</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Bank Account Details:</h4>
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <p className="text-sm text-gray-700"><span className="font-medium">Bank Name:</span> Commonwealth Bank</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Account Name:</span> Car Rental Services Pty Ltd</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">BSB:</span> 062-000</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Account Number:</span> 1234 5678 9012</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Reference:</span> Your Name + Vehicle</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Required Payment:</h4>
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <p className="text-sm text-gray-700"><span className="font-medium">Bond Amount:</span> ${selectedVehicle?.bondAmount || 0}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">1 Week Advance Rent:</span> ${selectedVehicle?.rentPerWeek || 0}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Total Required:</span> ${(selectedVehicle?.bondAmount || 0) + (selectedVehicle?.rentPerWeek || 0)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Paid ($) *
                    </label>
                    <input
                      type="number"
                      required
                      value={rentalForm.payment_amount}
                      onChange={(e) => setRentalForm({...rentalForm, payment_amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`${(selectedVehicle?.bondAmount || 0) + (selectedVehicle?.rentPerWeek || 0)}`}
                      min={(selectedVehicle?.bondAmount || 0) + (selectedVehicle?.rentPerWeek || 0)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the total amount you paid (Bond + 1 Week Rent)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Receipt (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setSelectedPaymentReceipt(e.target.files[0])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload payment receipt if you've already made the payment
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowRentalModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Submit Application
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

export default UserDashboard;
