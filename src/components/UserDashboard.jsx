import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, API_BASE_URL } from '../config';
import ImageSlider from './ImageSlider';

const UserDashboard = ({ user }) => {
  const [vehicles, setVehicles] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [selectedPaymentReceipt, setSelectedPaymentReceipt] = useState(null);
  const [activeTab, setActiveTab] = useState('vehicles');
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
    emergency_phone: ''
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
      const userBookings = data.filter(booking => booking.email === user.email);
      setUserBookings(userBookings);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    }
  };

  const handleRentalSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Submit rental application
      const rentalResponse = await fetch(API_ENDPOINTS.RENTAL_APPLICATIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicle_id: selectedVehicle.id,
          ...rentalForm
        }),
      });

      if (rentalResponse.ok) {
        const rentalData = await rentalResponse.json();
        
        // Upload payment receipt if selected
        if (selectedPaymentReceipt) {
          const formData = new FormData();
          formData.append('payment_receipt', selectedPaymentReceipt);
          formData.append('application_id', rentalData.id);

          const receiptResponse = await fetch(API_ENDPOINTS.UPLOAD_PAYMENT_RECEIPT, {
            method: 'POST',
            body: formData,
          });

          if (receiptResponse.ok) {
            const receiptData = await receiptResponse.json();
            
            // Update rental application with payment receipt
            await fetch(`${API_ENDPOINTS.RENTAL_APPLICATIONS}/${rentalData.id}/payment-receipt`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                payment_receipt_url: receiptData.url
              }),
            });
          }
        }

        setShowRentalModal(false);
        setSelectedVehicle(null);
        setSelectedPaymentReceipt(null);
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
          emergency_phone: ''
        });
        
        // Refresh data
        fetchVehicles();
        fetchUserBookings();
        alert('Rental application submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting rental:', error);
      alert('Error submitting rental application');
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.firstName}!</h1>
          <p className="mt-2 text-gray-600">Browse available vehicles and manage your bookings</p>
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
              Available Vehicles
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Bookings
            </button>
          </nav>
        </div>

        {/* Available Vehicles Tab */}
        {activeTab === 'vehicles' && (
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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
              <button
                onClick={fetchUserBookings}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
            
            {userBookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No bookings found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.vehicle_details?.make} {booking.vehicle_details?.model}
                        </h3>
                        <p className="text-sm text-gray-600">License: {booking.vehicle_details?.licensePlate}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><span className="font-medium">Contract Period:</span> {booking.contract_period}</p>
                      <p><span className="font-medium">Submitted:</span> {new Date(booking.submitted_at).toLocaleDateString()}</p>
                      {booking.processed_at && (
                        <p><span className="font-medium">Processed:</span> {new Date(booking.processed_at).toLocaleDateString()}</p>
                      )}
                    </div>

                    {/* Documents Section for Approved Bookings */}
                    {booking.status === 'approved' && booking.vehicle_details?.documents && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Your Vehicle Documents
                        </h4>
                        <div className="space-y-2">
                          {booking.vehicle_details.documents.map((doc, index) => {
                            const expiryStatus = getExpiryStatus(doc.expiryDate);
                            return (
                              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
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
                      {selectedVehicle.photoUrls && selectedVehicle.photoUrls.length > 0 ? (
                        <ImageSlider images={selectedVehicle.photoUrls} />
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

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowVehicleModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowVehicleModal(false);
                      setShowRentalModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Rent This Vehicle
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
