import { useState, useEffect } from 'react';
import { Car, ArrowLeft, Star, Calendar, MapPin, Fuel, Settings, Users, Clock, DollarSign } from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '../config';
import ImageSlider from './ImageSlider';

function AvailableCarsPage({ onBack }) {
  const [availableCars, setAvailableCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showCarModal, setShowCarModal] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchAvailableCars();
  }, []);

  const fetchAvailableCars = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.VEHICLES);
      if (response.ok) {
        const data = await response.json();
        // Filter only available cars
        const available = data.filter(vehicle => vehicle.status === 'available');
        setAvailableCars(available);
      } else {
        console.error('Failed to fetch available cars:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching available cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCarDetails = (car) => {
    setSelectedCar(car);
    setShowCarModal(true);
  };

  const handleCloseModal = () => {
    setShowCarModal(false);
    setSelectedCar(null);
  };

  const filteredCars = filterType === 'all' 
    ? availableCars 
    : availableCars.filter(car => car.vehicleType === filterType);

  const getVehicleTypeIcon = (type) => {
    switch (type) {
      case 'suv': return '🚙';
      case 'sedan': return '🚗';
      case 'hatchback': return '🚐';
      case 'van': return '🚐';
      case 'truck': return '🚛';
      default: return '🚗';
    }
  };

  const getFuelTypeIcon = (fuel) => {
    switch (fuel) {
      case 'petrol': return '⛽';
      case 'diesel': return '🛢️';
      case 'electric': return '⚡';
      case 'hybrid': return '🔋';
      default: return '⛽';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading available cars...</p>
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
              <button
                onClick={onBack}
                className="flex items-center mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl mr-4">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Available Cars
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {availableCars.length} cars ready for rental
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              All Types ({availableCars.length})
            </button>
            <button
              onClick={() => setFilterType('sedan')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'sedan'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Sedan ({availableCars.filter(car => car.vehicleType === 'sedan').length})
            </button>
            <button
              onClick={() => setFilterType('suv')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'suv'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              SUV ({availableCars.filter(car => car.vehicleType === 'suv').length})
            </button>
            <button
              onClick={() => setFilterType('hatchback')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'hatchback'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Hatchback ({availableCars.filter(car => car.vehicleType === 'hatchback').length})
            </button>
          </div>
        </div>

        {/* Cars Grid */}
        {filteredCars.length === 0 ? (
          <div className="text-center py-16">
            <Car className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Cars Available</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {filterType === 'all' 
                ? 'All vehicles are currently rented or in maintenance. Please check back later.'
                : `No ${filterType} vehicles are currently available. Try selecting a different vehicle type.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.map((car) => (
              <div
                key={car.id}
                className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                onClick={() => handleViewCarDetails(car)}
              >
                {/* Car Image */}
                <div className="relative h-48 rounded-t-2xl overflow-hidden">
                  <img
                    src={`${API_BASE_URL}${car.photoUrl}`}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-sm font-semibold text-gray-900">
                          {getVehicleTypeIcon(car.vehicleType)} {car.vehicleType}
                        </span>
                      </div>
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full">
                        <span className="text-sm font-semibold">Available</span>
                      </div>
                    </div>
                  </div>
                  {/* Fallback for missing images */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center" style={{ display: 'none' }}>
                    <div className="text-center">
                      <Car className="h-16 w-16 text-blue-600 mx-auto mb-2" />
                      <p className="text-blue-800 font-medium">{car.make} {car.model}</p>
                    </div>
                  </div>
                </div>

                {/* Car Details */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {car.make} {car.model}
                    </h3>
                    <p className="text-gray-600">{car.year} • {car.color}</p>
                  </div>

                  {/* Key Features */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Fuel className="h-4 w-4 mr-2 text-blue-600" />
                      {getFuelTypeIcon(car.fuelType)} {car.fuelType}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Settings className="h-4 w-4 mr-2 text-blue-600" />
                      {car.transmission}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                      {car.currentMileage?.toLocaleString()} km
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      {new Date(car.nextServiceDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Weekly Rent:</span>
                      <span className="text-lg font-bold text-green-600">${car.rentPerWeek}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Bond Amount:</span>
                      <span className="text-sm font-semibold text-gray-900">${car.bondAmount}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Car Details Modal */}
      {showCarModal && selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {/* Car Image Header */}
              <div className="relative h-64 rounded-t-2xl overflow-hidden">
                <img
                  src={`${API_BASE_URL}${selectedCar.photoUrl}`}
                  alt={`${selectedCar.make} ${selectedCar.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedCar.make} {selectedCar.model}
                  </h2>
                  <p className="text-white/90 text-lg">{selectedCar.year} • {selectedCar.color}</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                {/* Fallback for missing images */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center" style={{ display: 'none' }}>
                  <div className="text-center">
                    <Car className="h-24 w-24 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-blue-800 mb-2">
                      {selectedCar.make} {selectedCar.model}
                    </h2>
                    <p className="text-blue-700 text-lg">{selectedCar.year} • {selectedCar.color}</p>
                  </div>
                </div>
              </div>

              {/* Car Details */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Specifications */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Vehicle Specifications</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600">Make & Model</span>
                        <span className="font-semibold">{selectedCar.make} {selectedCar.model}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600">Year</span>
                        <span className="font-semibold">{selectedCar.year}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600">Color</span>
                        <span className="font-semibold">{selectedCar.color}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600">Vehicle Type</span>
                        <span className="font-semibold capitalize">{selectedCar.vehicleType}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600">Fuel Type</span>
                        <span className="font-semibold capitalize">{selectedCar.fuelType}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600">Transmission</span>
                        <span className="font-semibold capitalize">{selectedCar.transmission}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600">License Plate</span>
                        <span className="font-semibold">{selectedCar.licensePlate}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600">VIN Number</span>
                        <span className="font-semibold font-mono text-sm">{selectedCar.vin}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Pricing & Status */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Rental Information</h3>
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <Car className="h-5 w-5 text-green-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-green-800">Available for Rent</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Weekly Rent</span>
                            <span className="text-2xl font-bold text-green-600">${selectedCar.rentPerWeek}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bond Amount</span>
                            <span className="text-lg font-semibold text-gray-900">${selectedCar.bondAmount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-blue-800 mb-4">Vehicle Status</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Current Mileage</span>
                            <span className="font-semibold">{selectedCar.currentMileage?.toLocaleString()} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">ODO Meter</span>
                            <span className="font-semibold">{selectedCar.odoMeter?.toLocaleString()} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Next Service</span>
                            <span className="font-semibold">{new Date(selectedCar.nextServiceDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Features</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center text-sm">
                            <Fuel className="h-4 w-4 mr-2 text-blue-600" />
                            {selectedCar.fuelType}
                          </div>
                          <div className="flex items-center text-sm">
                            <Settings className="h-4 w-4 mr-2 text-blue-600" />
                            {selectedCar.transmission}
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                            {selectedCar.vehicleType}
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                            {selectedCar.year}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105">
                    Rent This Vehicle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvailableCarsPage;
