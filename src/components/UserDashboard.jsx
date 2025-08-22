import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';
import { 
  Car, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Search, 
  Filter, 
  Eye, 
  Heart, 
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  User,
  Settings,
  Bell,
  Menu,
  X as Close
} from 'lucide-react';

const API_ENDPOINTS = {
  VEHICLES: `${API_BASE_URL}/api/vehicles`,
  RENTAL_APPLICATIONS: `${API_BASE_URL}/api/rental-applications`
};

const ImageSlider = ({ images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <Close size={24} />
        </button>
        
        <button
          onClick={prevImage}
          className="absolute left-4 text-white hover:text-gray-300 z-10"
        >
          <ChevronLeft size={32} />
        </button>
        
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
        
        <button
          onClick={nextImage}
          className="absolute right-4 text-white hover:text-gray-300 z-10"
        >
          <ChevronRight size={32} />
        </button>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [vehicles, setVehicles] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showImageSlider, setShowImageSlider] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [detailsBooking, setDetailsBooking] = useState(null);
  const [applications, setApplications] = useState([]);
  const [detailsVehicle, setDetailsVehicle] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22 viewBox=%220 0 200 150%22%3E%3Crect width=%22200%22 height=%22150%22 fill=%22%23e5e7eb%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2212%22 fill=%22%236b7280%22%3ENo image%3C/text%3E%3C/svg%3E';

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    fetchVehicles();
    fetchUserBookings();
    fetchApplications();
  }, [currentUser, navigate]);

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

  const fetchApplications = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.RENTAL_APPLICATIONS);
      const data = await response.json();
      if (currentUser && currentUser.email) {
        const ownApps = data.filter(a => a.email === currentUser.email && a.status !== 'active');
        setApplications(ownApps);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.RENTAL_APPLICATIONS);
      const data = await response.json();
      
      if (currentUser && currentUser.email) {
        const userBookings = data.filter(booking => 
          booking.email === currentUser.email && booking.status === 'active'
        );
        setUserBookings(userBookings);
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      setUserBookings([]);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    switch (searchFilter) {
      case 'make':
        return vehicle.make?.toLowerCase().includes(searchLower);
      case 'model':
        return vehicle.model?.toLowerCase().includes(searchLower);
      case 'license':
        return vehicle.licensePlate?.toLowerCase().includes(searchLower);
      case 'all':
      default:
        return (
          vehicle.make?.toLowerCase().includes(searchLower) ||
          vehicle.model?.toLowerCase().includes(searchLower) ||
          vehicle.licensePlate?.toLowerCase().includes(searchLower) ||
          vehicle.color?.toLowerCase().includes(searchLower)
        );
    }
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const openImageSlider = (images) => {
    setCurrentImages(images);
    setShowImageSlider(true);
  };

  const openVehicleDetails = (vehicle) => {
    setDetailsVehicle(vehicle);
  };
  const closeVehicleDetails = () => setDetailsVehicle(null);

  const openBookingDetails = (booking) => {
    setDetailsBooking(booking);
  };
  const closeBookingDetails = () => setDetailsBooking(null);

  const getBookingStats = () => {
    const totalBookings = userBookings.length;
    const activeBookings = userBookings.filter(booking => booking.status === 'active').length;
    const totalValue = userBookings.reduce((sum, booking) => sum + (booking.weeklyRent || 0), 0);
    
    return { totalBookings, activeBookings, totalValue };
  };

  const nextPaymentDate = () => {
    // Assume weekly payments from contractStartDate
    const first = userBookings[0];
    if (!first) return null;
    const start = new Date(first.contractStartDate || new Date());
    const now = new Date();
    const msInWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksPassed = Math.floor((now - start) / msInWeek);
    const next = new Date(start.getTime() + (weeksPassed + 1) * msInWeek);
    return next.toLocaleDateString();
  };

  const stats = getBookingStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-xl border-b border-white/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Car className="w-7 h-7 text-white" />
              </div>
            <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  SK Car Rental
                </h1>
                <p className="text-xs text-gray-600 font-medium">Welcome {currentUser?.email?.split('@')[0] || 'User'}</p>
              </div>
        </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('available')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  activeTab === 'available'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl transform scale-105'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200'
                }`}
              >
                Available Cars
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  activeTab === 'applications'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl transform scale-105'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 border border-gray-200 hover:border-purple-200'
                }`}
              >
                Applications ({applications.length})
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {/* Compact profile menu */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => navigate('/profile')} 
                  className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 border border-red-200 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Logout
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {showMobileMenu ? <Close className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
                </div>
                  </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => {
                    setActiveTab('available');
                    setShowMobileMenu(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                    activeTab === 'available'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Available Cars
                    </button>
                    <button
                      onClick={() => {
                    setActiveTab('applications');
                    setShowMobileMenu(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                    activeTab === 'applications'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Applications ({applications.length})
                    </button>
                <div className="px-4 py-2 text-sm text-gray-600 border-t border-gray-200 pt-2">
                  <User className="w-4 h-4 inline mr-2" />
                  {currentUser?.email}
                </div>
              </div>
          </div>
        )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Welcome, {currentUser?.email?.split('@')[0] || 'driver'} 👋
              </h2>
              <p className="text-gray-600 text-lg">Browse available cars, track your applications, and view payment reminders.</p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Car className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab('available')}
              className={`py-2 text-sm font-medium border-b-2 ${activeTab === 'available' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`}
            >
              Available
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-2 text-sm font-medium border-b-2 ${activeTab === 'applications' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`}
            >
              Applications ({applications.length})
            </button>
          </nav>
        </div>

        {/* Premium Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl border border-blue-200 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Available Cars</p>
                <p className="text-3xl font-bold text-white">{vehicles.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl border border-green-200 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Bookings</p>
                <p className="text-3xl font-bold text-white">{stats.activeBookings}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 shadow-xl border border-yellow-200 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Total Value</p>
                <p className="text-3xl font-bold text-white">${stats.totalValue}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl border border-purple-200 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Next Payment</p>
                <p className="text-3xl font-bold text-white">{nextPaymentDate() || '—'}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        {activeTab === 'available' && (
          <div className="bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search cars by make, model, or license plate..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </div>
              <select
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="px-6 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm font-medium"
              >
                <option value="all">All Categories</option>
                <option value="make">Make</option>
                <option value="model">Model</option>
                <option value="license">License Plate</option>
              </select>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'available' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
              >
                {/* Car Images */}
                <div className="relative h-48 overflow-hidden">
                  {(() => {
                    const images = (
                      (vehicle.photoUrls && vehicle.photoUrls.length > 0)
                        ? vehicle.photoUrls.map((u) => (u.startsWith('http') || u.startsWith('data:') ? u : `${API_BASE_URL}${u}`))
                        : (vehicle.photoUrl
                            ? [vehicle.photoUrl.startsWith('http') || vehicle.photoUrl.startsWith('data:') ? vehicle.photoUrl : `${API_BASE_URL}${vehicle.photoUrl}`]
                            : []
                          )
                    );
                    if (images.length > 0) {
                      return (
                        <div className="relative h-full">
                          <img
                            src={images[0]}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="w-full h-full object-cover"
                            onClick={() => openImageSlider(images)}
                            onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                          />
                          <button
                            onClick={() => openImageSlider(images)}
                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {images.length > 1 && (
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                              +{images.length - 1} more
                            </div>
                          )}
                        </div>
                      );
                    }
                    return (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Car className="w-12 h-12 text-gray-400" />
                      </div>
                    );
                  })()}
                </div>

                {/* Car Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-gray-600 font-medium">{vehicle.year} • {vehicle.color}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">${vehicle.rentPerWeek}</p>
                      <p className="text-sm text-gray-500 font-medium">per week</p>
                        </div>
                      </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      License: {vehicle.licensePlate}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Car className="w-4 h-4 mr-2" />
                      {vehicle.transmission} • {vehicle.fuelType}
                                </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Bond: ${vehicle.bondAmount}
                  </div>
                </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => openVehicleDetails(vehicle)}
                      className="w-full border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        navigate('/rental-application', { state: { vehicle } });
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      Rent Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((booking) => (
              <div
                key={booking.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden transform hover:scale-105 transition-all duration-300"
              >
                {/* Car Images */}
                <div className="relative h-48 overflow-hidden">
                  {booking.vehicle_details?.photoUrls && booking.vehicle_details.photoUrls.length > 0 ? (
                    <div className="relative h-full">
                      <img
                        src={(booking.vehicle_details.photoUrls[0].startsWith('http') || booking.vehicle_details.photoUrls[0].startsWith('data:')) ? booking.vehicle_details.photoUrls[0] : `${API_BASE_URL}${booking.vehicle_details.photoUrls[0]}`}
                        alt={`${booking.vehicle_details.make} ${booking.vehicle_details.model}`}
                        className="w-full h-full object-cover"
                        onClick={() => openImageSlider(booking.vehicle_details.photoUrls.map((u) => (u.startsWith('http') || u.startsWith('data:')) ? u : `${API_BASE_URL}${u}`))}
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                      />
                      <button
                        onClick={() => openImageSlider(booking.vehicle_details.photoUrls.map((u) => (u.startsWith('http') || u.startsWith('data:')) ? u : `${API_BASE_URL}${u}`))}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Car className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {booking.status || 'pending'}
                  </div>
                </div>

                {/* Booking Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {booking.vehicle_details?.make} {booking.vehicle_details?.model}
                      </h3>
                      <p className="text-gray-600">Application #{booking.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">${booking.weeklyRent}</p>
                      <p className="text-sm text-gray-500">per week</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {booking.contractStartDate} - {booking.contractEndDate}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Bond: ${booking.bondAmount}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {booking.vehicle_details?.licensePlate}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button onClick={() => openBookingDetails(booking)} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200">
                      View Details
                    </button>
                    {booking.documents?.length > 0 && (
                      <a
                        href={`${API_BASE_URL}/api/documents/${booking.id}/${(booking.documents?.[0]?.id)||0}/download`}
                        className="flex-1 text-center bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-all duration-200"
                      >
                        Download Docs
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
        )}

        {/* Empty State */}
        {activeTab === 'available' && filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cars found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}

        {activeTab === 'applications' && applications.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600">Start by renting a car from our available selection</p>
            <button
              onClick={() => setActiveTab('available')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              Browse Cars
            </button>
      </div>
        )}
      </main>

      {/* Image Slider Modal */}
      {showImageSlider && (
        <ImageSlider
          images={currentImages}
          onClose={() => setShowImageSlider(false)}
        />
      )}

      {detailsVehicle && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{detailsVehicle.make} {detailsVehicle.model}</h3>
              <button onClick={closeVehicleDetails} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {(() => {
                  const images = (detailsVehicle.photoUrls && detailsVehicle.photoUrls.length > 0) ? detailsVehicle.photoUrls : (detailsVehicle.photoUrl ? [detailsVehicle.photoUrl] : []);
                  const img = images[0];
                  return img ? (
                    <img src={img.startsWith('http') || img.startsWith('data:') ? img : `${API_BASE_URL}${img}`} alt="car" className="w-full h-48 object-cover rounded-lg" />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center"><Car className="w-10 h-10 text-gray-400" /></div>
                  );
                })()}
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">Year:</span> {detailsVehicle.year}</p>
                <p><span className="font-medium">Color:</span> {detailsVehicle.color}</p>
                <p><span className="font-medium">Type:</span> {detailsVehicle.vehicleType}</p>
                <p><span className="font-medium">Transmission:</span> {detailsVehicle.transmission}</p>
                <p><span className="font-medium">Fuel:</span> {detailsVehicle.fuelType}</p>
                <p><span className="font-medium">Bond:</span> ${detailsVehicle.bondAmount}</p>
                <p><span className="font-medium">Weekly Rent:</span> ${detailsVehicle.rentPerWeek}</p>
              </div>
            </div>
            <div className="mt-6 text-right">
              <button onClick={() => { closeVehicleDetails(); navigate('/rental-application', { state: { vehicle: detailsVehicle } }); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Proceed to Rent</button>
            </div>
          </div>
        </div>
      )}

      {detailsBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Booking Details</h3>
              <button onClick={closeBookingDetails} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">Vehicle:</span> {detailsBooking.vehicle_details?.make} {detailsBooking.vehicle_details?.model}</p>
              <p><span className="font-medium">Period:</span> {detailsBooking.contractStartDate} → {detailsBooking.contractEndDate}</p>
              <p><span className="font-medium">Weekly Rent:</span> ${detailsBooking.weeklyRent}</p>
              <p><span className="font-medium">Bond:</span> ${detailsBooking.bondAmount}</p>
              <p><span className="font-medium">Status:</span> {detailsBooking.status}</p>
            </div>
            {detailsBooking.documents?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Documents</h4>
                <ul className="space-y-1 text-sm">
                  {detailsBooking.documents.map((doc, idx) => (
                    <li key={idx}>
                      <a
                        className="text-blue-600 hover:underline"
                        href={`${API_BASE_URL}/api/documents/${detailsBooking.id}/${doc.id}/download`}
                      >
                        {doc.documentType} – {doc.fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-6 text-right">
              <button onClick={closeBookingDetails} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
