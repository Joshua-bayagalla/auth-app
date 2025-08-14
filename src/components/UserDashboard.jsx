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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    fetchVehicles();
    fetchUserBookings();
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

  const getBookingStats = () => {
    const totalBookings = userBookings.length;
    const activeBookings = userBookings.filter(booking => booking.status === 'active').length;
    const totalValue = userBookings.reduce((sum, booking) => sum + (booking.weeklyRent || 0), 0);
    
    return { totalBookings, activeBookings, totalValue };
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  SK Car Rental
                </h1>
                <p className="text-xs text-gray-500">Australia</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('available')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'available'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Available Cars
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'bookings'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                My Bookings ({stats.activeBookings})
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{currentUser?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
              
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
                    setActiveTab('bookings');
                    setShowMobileMenu(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                    activeTab === 'bookings'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  My Bookings ({stats.activeBookings})
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Cars</p>
                <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalValue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        {activeTab === 'available' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search cars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <select
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="all">All</option>
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
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
              >
                {/* Car Images */}
                <div className="relative h-48 overflow-hidden">
                  {vehicle.photoUrls && vehicle.photoUrls.length > 0 ? (
                    <div className="relative h-full">
                      <img
                        src={vehicle.photoUrls[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                        onClick={() => openImageSlider(vehicle.photoUrls)}
                      />
                      <button
                        onClick={() => openImageSlider(vehicle.photoUrls)}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {vehicle.photoUrls.length > 1 && (
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                          +{vehicle.photoUrls.length - 1} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Car className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Car Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-gray-600">{vehicle.year} • {vehicle.color}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">${vehicle.rentPerWeek}</p>
                      <p className="text-sm text-gray-500">per week</p>
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

                  <button
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      navigate('/rental-application', { state: { vehicle } });
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Rent This Car
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden transform hover:scale-105 transition-all duration-300"
              >
                {/* Car Images */}
                <div className="relative h-48 overflow-hidden">
                  {booking.vehicle_details?.photoUrls && booking.vehicle_details.photoUrls.length > 0 ? (
                    <div className="relative h-full">
                      <img
                        src={booking.vehicle_details.photoUrls[0]}
                        alt={`${booking.vehicle_details.make} ${booking.vehicle_details.model}`}
                        className="w-full h-full object-cover"
                        onClick={() => openImageSlider(booking.vehicle_details.photoUrls)}
                      />
                      <button
                        onClick={() => openImageSlider(booking.vehicle_details.photoUrls)}
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
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Active
                  </div>
                </div>

                {/* Booking Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {booking.vehicle_details?.make} {booking.vehicle_details?.model}
                      </h3>
                      <p className="text-gray-600">Booking #{booking.id}</p>
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
                      Bond Paid: ${booking.bondAmount}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {booking.vehicle_details?.licensePlate}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200">
                      View Details
                    </button>
                    <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-all duration-200">
                      Download Docs
                    </button>
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

        {activeTab === 'bookings' && userBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active bookings</h3>
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
    </div>
  );
};

export default UserDashboard;
