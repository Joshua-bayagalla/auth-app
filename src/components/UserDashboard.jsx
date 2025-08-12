import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Calendar, DollarSign, Gauge, FileText, Download, Eye, LogOut, Search, Filter, Star, MapPin, Clock, Shield, Users, TrendingUp } from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '../config';
import ImageSlider from './ImageSlider';

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [rentalForm, setRentalForm] = useState({
    contractPeriod: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    contractSigned: false,
    paymentReceiptUploaded: false
  });
  const [selectedPaymentReceipt, setSelectedPaymentReceipt] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [userBookings, setUserBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('vehicles'); // 'vehicles' or 'bookings'
  const [selectedRentalId, setSelectedRentalId] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const userObj = JSON.parse(userData);
    if (userObj.role !== 'user') {
      navigate('/dashboard');
      return;
    }

    setUser(userObj);
    setLoading(false);
    
    // Fetch vehicles from backend
    fetchVehicles();
    // Fetch user bookings
    fetchUserBookings();
  }, [navigate]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.VEHICLES);
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
        setFilteredVehicles(data);
      } else {
        console.error('Failed to fetch vehicles:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.RENTAL_APPLICATIONS);
      if (response.ok) {
        const data = await response.json();
        // Filter bookings for current user
        const userEmail = user?.email;
        const userBookings = data.filter(booking => 
          booking.email === userEmail
        );
        setUserBookings(userBookings);
      } else {
        console.error('Failed to fetch user bookings:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterVehicles(term, filterStatus);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    filterVehicles(searchTerm, status);
  };

  const filterVehicles = (search, status) => {
    let filtered = vehicles;

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === status);
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter(vehicle =>
        vehicle.make.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.ownerName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredVehicles(filtered);
  };

  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleModal(true);
  };

  const handleCloseModal = () => {
    setShowVehicleModal(false);
    setShowRentalModal(false);
    setSelectedVehicle(null);
    setCurrentStep(1);
    setRentalForm({
      contractPeriod: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      contractSigned: false,
      paymentReceiptUploaded: false
    });
    setSelectedPaymentReceipt(null);
  };

  const handleRentVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowRentalModal(true);
    setCurrentStep(1);
  };

  const handleRentalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRentalForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePaymentReceiptSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedPaymentReceipt(file);
    }
  };

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmitRental = async () => {
    try {
      const rentalData = {
        vehicle_id: selectedVehicle.id,
        contract_period: rentalForm.contractPeriod,
        first_name: rentalForm.firstName,
        last_name: rentalForm.lastName,
        email: rentalForm.email,
        phone: rentalForm.phone,
        license_number: rentalForm.licenseNumber,
        license_expiry: rentalForm.licenseExpiry,
        address: rentalForm.address,
        emergency_contact: rentalForm.emergencyContact,
        emergency_phone: rentalForm.emergencyPhone
      };

      const response = await fetch(API_ENDPOINTS.RENTALS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rentalData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Rental application submitted successfully! Please upload your payment receipt.');
        
        // Store the rental application ID for payment receipt upload
        setSelectedRentalId(result.rental_id);
        
        // Move to payment receipt step
        setCurrentStep(4);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error submitting rental:', error);
      alert('Error submitting rental application');
    }
  };

  const handlePaymentReceiptUpload = async () => {
    if (!selectedPaymentReceipt) {
      alert('Please select a payment receipt file');
      return;
    }
    
    try {
      // First upload the payment receipt
      const formData = new FormData();
      formData.append('file', selectedPaymentReceipt);
      
      const uploadResponse = await fetch(`${API_BASE_URL}/api/upload-payment-receipt`, {
        method: 'POST',
        body: formData
      });
      
      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        
        // Now update the rental application with payment receipt
        const updateResponse = await fetch(`${API_BASE_URL}/api/rentals/${selectedRentalId}/payment-receipt`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_receipt_url: uploadResult.url
          })
        });
        
        if (updateResponse.ok) {
          alert('Payment receipt uploaded successfully! Your application is now pending admin approval.');
          handleCloseModal();
          fetchVehicles(); // Refresh vehicles to update status
          fetchUserBookings(); // Refresh user bookings
        } else {
          alert('Failed to update rental application with payment receipt');
        }
      } else {
        alert('Failed to upload payment receipt');
      }
    } catch (error) {
      console.error('Error uploading payment receipt:', error);
      alert('Error uploading payment receipt');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'rented': return 'bg-blue-100 text-blue-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'maintenance': return 'Maintenance';
      case 'rented': return 'Rented';
      default: return 'Out of Service';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your vehicle fleet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl mr-4">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Vehicle Fleet
                </h1>
                <p className="text-sm text-gray-600 mt-1">Explore our premium vehicle collection</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700 font-medium">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{vehicles.filter(v => v.status === 'available').length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{vehicles.filter(v => v.status === 'maintenance').length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rented</p>
                <p className="text-2xl font-bold text-purple-600">{vehicles.filter(v => v.status === 'rented').length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'vehicles'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Car className="h-4 w-4" />
                <span>Available Vehicles</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'bookings'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>My Bookings ({userBookings.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search vehicles by make, model, license plate, or owner..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-200 text-lg"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg ${
                  filterStatus === 'all' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25' 
                    : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-xl'
                }`}
              >
                All Vehicles
              </button>
              <button
                onClick={() => handleFilterChange('available')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg ${
                  filterStatus === 'available' 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-500/25' 
                    : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-xl'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => handleFilterChange('maintenance')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg ${
                  filterStatus === 'maintenance' 
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-yellow-500/25' 
                    : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-xl'
                }`}
              >
                Maintenance
              </button>
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20">
              {/* Vehicle Photo */}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                {vehicle.photoUrls && vehicle.photoUrls.length > 0 ? (
                  <ImageSlider 
                    images={vehicle.photoUrls.map(url => `${API_BASE_URL}${url}`)} 
                    autoSlide={true} 
                    interval={3000}
                  />
                ) : vehicle.photoUrl ? (
                  <img 
                    src={`${API_BASE_URL}${vehicle.photoUrl}`} 
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${vehicle.photoUrl ? 'hidden' : 'flex'}`}>
                  <Car className="h-20 w-20 text-gray-400" />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg ${getStatusColor(vehicle.status)}`}>
                    {getStatusText(vehicle.status)}
                  </span>
                </div>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

                            {/* Vehicle Details */}
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.make} {vehicle.model}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {vehicle.year}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                        {vehicle.color}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <Gauge className="h-5 w-5 mr-3 text-blue-600" />
                      <span className="font-medium text-gray-900">ODO Meter</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{vehicle.odoMeter?.toLocaleString()} km</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-3 text-green-600" />
                      <span className="font-medium text-gray-900">Bond Amount</span>
                    </div>
                    <span className="text-lg font-semibold text-green-600">${vehicle.bondAmount?.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-3 text-purple-600" />
                      <span className="font-medium text-gray-900">Weekly Rent</span>
                    </div>
                    <span className="text-lg font-semibold text-purple-600">${vehicle.rentPerWeek}/week</span>
                  </div>
                  
                  {vehicle.nextServiceDate && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-3 text-yellow-600" />
                        <span className="font-medium text-gray-900">Next Service</span>
                      </div>
                      <span className="text-sm font-medium text-yellow-700">
                        {new Date(vehicle.nextServiceDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {vehicle.ownerName && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-3 text-blue-600" />
                        <span className="font-medium text-gray-900">Owner</span>
                      </div>
                      <span className="text-sm font-medium text-blue-700">{vehicle.ownerName}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500 font-mono">
                    {vehicle.licensePlate}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleViewVehicle(vehicle)}
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                    {vehicle.status === 'available' && (
                      <button
                        onClick={() => handleRentVehicle(vehicle)}
                        className="flex items-center px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Car className="h-4 w-4 mr-2" />
                        Rent Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredVehicles.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 max-w-md mx-auto">
              <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Car className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No vehicles found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria to find the perfect vehicle.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  filterVehicles('', 'all');
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Bookings Tab Content */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {userBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userBookings.map((booking) => (
                  <div key={booking.id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20">
                    {/* Vehicle Photo */}
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      {booking.vehicle && booking.vehicle.photoUrls && booking.vehicle.photoUrls.length > 0 ? (
                        <ImageSlider 
                          images={booking.vehicle.photoUrls.map(url => `${API_BASE_URL}${url}`)} 
                          autoSlide={true} 
                          interval={3000}
                        />
                      ) : booking.vehicle && booking.vehicle.photoUrl ? (
                        <img 
                          src={`${API_BASE_URL}${booking.vehicle.photoUrl}`} 
                          alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="h-20 w-20 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg ${
                          booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                          booking.status === 'payment_received' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status === 'approved' ? 'Approved' :
                           booking.status === 'payment_received' ? 'Payment Received' :
                           booking.status === 'pending' ? 'Pending' :
                           'Rejected'}
                        </span>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : 'Vehicle Details'}
                      </h3>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Contract Period:</span>
                          <span className="text-sm font-medium text-gray-900">{booking.contract_period}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">License Number:</span>
                          <span className="text-sm font-medium text-gray-900">{booking.license_number}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">License Expiry:</span>
                          <span className="text-sm font-medium text-gray-900">{booking.license_expiry}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="text-sm font-medium text-gray-900">{booking.phone}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          <strong>Address:</strong> {booking.address}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <strong>Emergency Contact:</strong> {booking.emergency_contact} ({booking.emergency_phone})
                        </div>
                        {booking.payment_receipt_uploaded && (
                          <div className="text-sm text-green-600 mt-2">
                            ✅ Payment Receipt Uploaded
                          </div>
                        )}
                        {booking.status === 'payment_received' && (
                          <div className="text-sm text-blue-600 mt-1">
                            ⏳ Waiting for Admin Approval
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 max-w-md mx-auto">
                  <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No bookings yet</h3>
                  <p className="text-gray-600 mb-6">You haven't made any vehicle bookings yet. Start by browsing available vehicles!</p>
                  <button
                    onClick={() => setActiveTab('vehicles')}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Browse Vehicles
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vehicle Detail Modal */}
      {showVehicleModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-8 border-b border-gray-200/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl mr-4">
                    <Car className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Vehicle Details</h2>
                    <p className="text-gray-600">Complete information about {selectedVehicle.make} {selectedVehicle.model}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Vehicle Photo */}
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <Car className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Vehicle Photo</h3>
                  </div>
                  {selectedVehicle.photoUrls && selectedVehicle.photoUrls.length > 0 ? (
                    <div className="aspect-video rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
                      <ImageSlider 
                        images={selectedVehicle.photoUrls.map(url => `${API_BASE_URL}${url}`)} 
                        autoSlide={true} 
                        interval={3000}
                      />
                    </div>
                  ) : selectedVehicle.photoUrl ? (
                    <div className="aspect-video rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
                      <img 
                        src={`${API_BASE_URL}${selectedVehicle.photoUrl}`} 
                        alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center bg-gray-100" style={{ display: 'none' }}>
                        <Car className="h-20 w-20 text-gray-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-2xl border border-gray-200 flex items-center justify-center bg-gray-50 shadow-xl">
                      <div className="text-center">
                        <Car className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No photo available</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedVehicle.photoName && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Photo Name:</span>
                        <span className="text-sm text-gray-600">{selectedVehicle.photoName}</span>
                      </div>
                      {selectedVehicle?.photoSize && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">File Size:</span>
                          <span className="text-sm text-gray-600">{(selectedVehicle.photoSize / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Vehicle Information */}
                <div className="space-y-8">
                  {/* Basic Information */}
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <Star className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Make</label>
                        <p className="text-lg font-bold text-gray-900">{selectedVehicle.make}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
                        <p className="text-lg font-bold text-gray-900">{selectedVehicle.model}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                        <p className="text-lg font-bold text-gray-900">{selectedVehicle.year}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                        <p className="text-lg font-bold text-gray-900">{selectedVehicle.color}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">License Plate</label>
                        <p className="text-lg font-bold text-gray-900 font-mono">{selectedVehicle.licensePlate}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">VIN Number</label>
                        <p className="text-lg font-bold text-gray-900 font-mono">{selectedVehicle.vin}</p>
                      </div>
                      {selectedVehicle.ownerName && (
                        <div className="md:col-span-2 bg-blue-50 rounded-xl p-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Owner Name</label>
                          <p className="text-lg font-bold text-blue-900">{selectedVehicle.ownerName}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Financial Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bond Amount</label>
                        <p className="text-2xl font-bold text-green-600">${selectedVehicle.bondAmount?.toLocaleString()}</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Rent per Week</label>
                        <p className="text-2xl font-bold text-purple-600">${selectedVehicle.rentPerWeek?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Technical Information */}
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <Gauge className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Technical Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
                        <p className="text-lg font-bold text-blue-900 capitalize">{selectedVehicle.vehicleType}</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Fuel Type</label>
                        <p className="text-lg font-bold text-blue-900 capitalize">{selectedVehicle.fuelType}</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Transmission</label>
                        <p className="text-lg font-bold text-blue-900 capitalize">{selectedVehicle.transmission}</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(selectedVehicle.status)}`}>
                          {getStatusText(selectedVehicle.status)}
                        </span>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Current Mileage</label>
                        <p className="text-lg font-bold text-blue-900">{selectedVehicle.currentMileage?.toLocaleString()} km</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ODO Meter</label>
                        <p className="text-lg font-bold text-blue-900">{selectedVehicle.odoMeter?.toLocaleString()} km</p>
                      </div>
                    </div>
                  </div>

                  {/* Service Information */}
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Service Information</h3>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Next Service Date</label>
                      <p className="text-lg font-bold text-yellow-700">
                        {selectedVehicle.nextServiceDate ? new Date(selectedVehicle.nextServiceDate).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>

                  {/* Record Information */}
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Record Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Created</label>
                        <p className="text-lg font-bold text-purple-700">
                          {selectedVehicle.createdAt ? new Date(selectedVehicle.createdAt).toLocaleString() : 'Unknown'}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Last Updated</label>
                        <p className="text-lg font-bold text-purple-700">
                          {selectedVehicle.updatedAt ? new Date(selectedVehicle.updatedAt).toLocaleString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t border-gray-200/50">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Car className="h-5 w-5 mr-2 text-blue-600" />
                  Rent Vehicle: {selectedVehicle.make} {selectedVehicle.model}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Progress Steps */}
              <div className="mb-8">
                <div className="flex items-center justify-center space-x-4">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step}
                      </div>
                      {step < 4 && (
                        <div className={`w-16 h-1 mx-2 ${
                          currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-2 space-x-8 text-sm">
                  <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Select Period</span>
                  <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Personal Details</span>
                  <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Payment</span>
                  <span className={currentStep >= 4 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Submit</span>
                </div>
              </div>

              {/* Step 1: Contract Period Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Vehicle Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Vehicle:</span> {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                      </div>
                      <div>
                        <span className="font-medium">Bond Amount:</span> ${selectedVehicle.bondAmount?.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Weekly Rent:</span> ${selectedVehicle.rentPerWeek?.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">License Plate:</span> {selectedVehicle.licensePlate}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Contract Period *
                    </label>
                    <select
                      name="contractPeriod"
                      value={rentalForm.contractPeriod}
                      onChange={handleRentalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Choose contract period...</option>
                      <option value="1 month">1 Month</option>
                      <option value="3 months">3 Months</option>
                      <option value="6 months">6 Months</option>
                      <option value="12 months">12 Months</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={!rentalForm.contractPeriod}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Personal Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={rentalForm.firstName}
                        onChange={handleRentalInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={rentalForm.lastName}
                        onChange={handleRentalInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={rentalForm.email}
                        onChange={handleRentalInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={rentalForm.phone}
                        onChange={handleRentalInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={rentalForm.licenseNumber}
                        onChange={handleRentalInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry *</label>
                      <input
                        type="date"
                        name="licenseExpiry"
                        value={rentalForm.licenseExpiry}
                        onChange={handleRentalInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <textarea
                      name="address"
                      value={rentalForm.address}
                      onChange={handleRentalInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact *</label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={rentalForm.emergencyContact}
                        onChange={handleRentalInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone *</label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={rentalForm.emergencyPhone}
                        onChange={handleRentalInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-between space-x-3">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={!rentalForm.firstName || !rentalForm.lastName || !rentalForm.email || !rentalForm.phone || !rentalForm.licenseNumber || !rentalForm.licenseExpiry || !rentalForm.address || !rentalForm.emergencyContact || !rentalForm.emergencyPhone}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-yellow-900 mb-2">Payment Instructions</h3>
                    <div className="space-y-2 text-sm text-yellow-800">
                      <p><strong>Bond Amount:</strong> ${selectedVehicle.bondAmount?.toLocaleString()}</p>
                      <p><strong>Weekly Rent:</strong> ${selectedVehicle.rentPerWeek?.toLocaleString()}</p>
                      <p><strong>Contract Period:</strong> {rentalForm.contractPeriod}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Bank Details</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p><strong>Bank Name:</strong> Example Bank</p>
                      <p><strong>Account Name:</strong> Vehicle Rental Company</p>
                      <p><strong>Account Number:</strong> 1234-5678-9012-3456</p>
                      <p><strong>BSB:</strong> 123-456</p>
                      <p><strong>Reference:</strong> {selectedVehicle.licensePlate}-{rentalForm.firstName}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-green-900 mb-2">Contract Agreement</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          name="contractSigned"
                          checked={rentalForm.contractSigned}
                          onChange={handleRentalInputChange}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-green-800">
                          I agree to the terms and conditions of the vehicle rental contract. I understand that I am responsible for the bond amount and weekly rent payments.
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between space-x-3">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={!rentalForm.contractSigned}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Upload Payment Receipt */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-green-900 mb-2">Upload Payment Receipt</h3>
                    <p className="text-sm text-green-800 mb-4">
                      Please upload a screenshot or photo of your payment receipt. This should show the transaction details including the amount paid and reference number.
                    </p>
                    
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handlePaymentReceiptSelect}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      
                      {selectedPaymentReceipt && (
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-blue-600 mr-2" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{selectedPaymentReceipt.name}</p>
                                <p className="text-xs text-gray-500">{(selectedPaymentReceipt.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Application Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Vehicle:</span> {selectedVehicle.make} {selectedVehicle.model}
                      </div>
                      <div>
                        <span className="font-medium">Contract Period:</span> {rentalForm.contractPeriod}
                      </div>
                      <div>
                        <span className="font-medium">Name:</span> {rentalForm.firstName} {rentalForm.lastName}
                      </div>
                      <div>
                        <span className="font-medium">License:</span> {rentalForm.licenseNumber}
                      </div>
                      <div>
                        <span className="font-medium">Bond Amount:</span> ${selectedVehicle.bondAmount?.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Weekly Rent:</span> ${selectedVehicle.rentPerWeek?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between space-x-3">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleSubmitRental}
                      disabled={!selectedPaymentReceipt}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Application
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;

