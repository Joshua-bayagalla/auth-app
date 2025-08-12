import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Settings, LogOut, Activity, FileText, AlertTriangle, CheckCircle, Car, DollarSign, MapPin, Clock, Briefcase, Wrench, Calendar, Home, Plus, Search, X, Eye, Edit, Download, Upload, File, Star, TrendingUp, Building, CreditCard, ClipboardList, CheckSquare, XSquare } from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '../config';
import AvailableCarsPage from './AvailableCarsPage';
import ImageSlider from './ImageSlider';

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [showViewVehicleModal, setShowViewVehicleModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
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
  const [selectedVehiclePhoto, setSelectedVehiclePhoto] = useState(null);
  const [selectedVehiclePhotos, setSelectedVehiclePhotos] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showViewDriverModal, setShowViewDriverModal] = useState(false);
  const [showEditDriverModal, setShowEditDriverModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [documentTypes, setDocumentTypes] = useState({});
  const [documentForm, setDocumentForm] = useState({
    documentType: '',
    expiryDate: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [driverForm, setDriverForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    selectedVehicleId: '',
    contractStartDate: '',
    contractEndDate: '',
    contractPeriod: '',
    bondAmount: '',
    weeklyRent: '',
    contractSigned: false,
    paymentReceiptUploaded: false,
    paymentReceiptUrl: '',
    status: 'pending'
  });
  
  // Rental Applications state
  const [rentalApplications, setRentalApplications] = useState([]);
  const [showRentalApplicationModal, setShowRentalApplicationModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  
  // Available cars state
  const [availableCars, setAvailableCars] = useState([]);
  const [showAvailableCarsPage, setShowAvailableCarsPage] = useState(false);

  useEffect(() => {
    console.log('AdminDashboard useEffect running...');
    const userData = localStorage.getItem('user');
    console.log('User data from localStorage:', userData);
    
    if (!userData) {
      console.log('No user data found, redirecting to login');
      navigate('/login');
      return;
    }

    const userObj = JSON.parse(userData);
    console.log('Parsed user object:', userObj);
    
    // For demo purposes, allow access if user has admin role or if no role is specified
    if (userObj.role && userObj.role !== 'admin') {
      console.log('User is not admin, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }

    console.log('Setting user and loading data...');
    setUser(userObj);
    setLoading(false);
    
    // Fetch vehicles from backend
    fetchVehicles();
    fetchDrivers();
    fetchDocumentTypes();
    fetchRentalApplications();
    fetchAvailableCars();
  }, [navigate]);

  const fetchVehicles = async () => {
    try {
      console.log('Fetching vehicles from backend...');
      const response = await fetch(API_ENDPOINTS.VEHICLES);
      console.log('Fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched vehicles:', data);
        setVehicles(data);
      } else {
        console.error('Failed to fetch vehicles:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      console.log('Fetching drivers from backend...');
      const response = await fetch(API_ENDPOINTS.DRIVERS);
      console.log('Driver fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched drivers:', data);
        setDrivers(data);
      } else {
        console.error('Failed to fetch drivers:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/document-types');
      if (response.ok) {
        const data = await response.json();
        setDocumentTypes(data);
      }
    } catch (error) {
      console.error('Error fetching document types:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAddVehicle = () => {
    setShowAddVehicleModal(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleForm({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      vin: vehicle.vin,
      bondAmount: vehicle.bondAmount.toString(),
      rentPerWeek: vehicle.rentPerWeek.toString(),
      currentMileage: vehicle.currentMileage.toString(),
      odoMeter: vehicle.odoMeter.toString(),
      nextServiceDate: vehicle.nextServiceDate,
      vehicleType: vehicle.vehicleType,
      color: vehicle.color,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      status: vehicle.status,
      ownerName: vehicle.ownerName || ''
    });
    setSelectedVehiclePhoto(null);
    setShowEditVehicleModal(true);
  };

  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowViewVehicleModal(true);
  };

  const handleAddDriver = () => {
    setShowAddDriverModal(true);
  };

  const handleViewDriver = (driver) => {
    setSelectedDriver(driver);
    setShowViewDriverModal(true);
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setDriverForm({
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry,
      address: driver.address,
      emergencyContact: driver.emergencyContact,
      emergencyPhone: driver.emergencyPhone,
      selectedVehicleId: driver.selectedVehicleId || '',
      contractStartDate: driver.contractStartDate || '',
      contractEndDate: driver.contractEndDate || '',
      contractPeriod: driver.contractPeriod || '',
      bondAmount: driver.bondAmount || '',
      weeklyRent: driver.weeklyRent || '',
      contractSigned: driver.contractSigned || false,
      paymentReceiptUploaded: driver.paymentReceiptUploaded || false,
      paymentReceiptUrl: driver.paymentReceiptUrl || '',
      status: driver.status || 'pending'
    });
    setShowEditDriverModal(true);
  };

  const handleAddDocument = (driver) => {
    setSelectedDriver(driver);
    setDocumentForm({
      documentType: '',
      expiryDate: ''
    });
    setShowDocumentModal(true);
  };

  const handleOpenAvailableCars = () => {
    setShowAvailableCarsPage(true);
  };

  const handleCloseAvailableCars = () => {
    setShowAvailableCarsPage(false);
  };

  const handleCloseModal = () => {
    setShowAddVehicleModal(false);
    setShowEditVehicleModal(false);
    setShowViewVehicleModal(false);
    setShowAddDriverModal(false);
    setShowViewDriverModal(false);
    setShowEditDriverModal(false);
    setShowDocumentModal(false);
    setShowRentalApplicationModal(false);
    setSelectedDriver(null);
    setSelectedVehicle(null);
    setSelectedApplication(null);
    setSelectedFile(null);
    setSelectedVehiclePhoto(null);
    setSelectedVehiclePhotos([]);
    setAdminNotes('');
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
    setDriverForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      selectedVehicleId: '',
      contractStartDate: '',
      contractEndDate: '',
      contractPeriod: '',
      bondAmount: '',
      weeklyRent: '',
      contractSigned: false,
      paymentReceiptUploaded: false,
      paymentReceiptUrl: '',
      status: 'pending'
    });
    setDocumentForm({
      documentType: '',
      expiryDate: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDriverInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDriverForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDocumentInputChange = (e) => {
    const { name, value } = e.target;
    setDocumentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, DOC, DOCX, JPG, PNG files are allowed');
        e.target.value = '';
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleSubmitDocument = async (e) => {
    e.preventDefault();
    
    if (!documentForm.documentType || !selectedFile) {
      alert('Please select document type and file');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('documentType', documentForm.documentType);
      formData.append('documentFile', selectedFile);
      if (documentForm.expiryDate) {
        formData.append('expiryDate', documentForm.expiryDate);
      }
      formData.append('uploadedBy', 'admin');

              const response = await fetch(`http://localhost:8000/api/drivers/${selectedDriver.id}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh drivers to get updated document list
        fetchDrivers();
        handleCloseModal();
        setSelectedFile(null);
        alert('Document uploaded successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to upload document: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleSubmitVehicle = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.year || !vehicleForm.licensePlate || !vehicleForm.vin) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      let photoUrl = "";
      let photoUrls = [];
      
      // Upload photos if selected
      if (selectedVehiclePhotos.length > 0) {
        const uploadPromises = selectedVehiclePhotos.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadResponse = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            return uploadResult.url;
          } else {
            throw new Error('Failed to upload photo');
          }
        });
        
        const uploadedUrls = await Promise.all(uploadPromises);
        photoUrl = uploadedUrls[0]; // Use the first photo as main photo
        photoUrls = uploadedUrls; // Store all photo URLs
      }
      
      const vehicleData = {
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: vehicleForm.year,
        licensePlate: vehicleForm.licensePlate,
        vin: vehicleForm.vin,
        bondAmount: parseInt(vehicleForm.bondAmount) || 0,
        rentPerWeek: parseInt(vehicleForm.rentPerWeek) || 0,
        currentMileage: parseInt(vehicleForm.currentMileage) || 0,
        odoMeter: parseInt(vehicleForm.odoMeter) || 0,
        nextServiceDate: vehicleForm.nextServiceDate,
        vehicleType: vehicleForm.vehicleType,
        color: vehicleForm.color,
        fuelType: vehicleForm.fuelType,
        transmission: vehicleForm.transmission,
        status: vehicleForm.status,
        photoUrl: photoUrl,
        photoUrls: photoUrls
      };

      const response = await fetch(API_ENDPOINTS.CREATE_VEHICLE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData)
      });

      if (response.ok) {
        const result = await response.json();
        // Add new vehicle to the list
        setVehicles(prev => [...prev, result.vehicle]);
        handleCloseModal();
        setSelectedVehiclePhotos([]);
        alert('Vehicle added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to add vehicle: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.year || !vehicleForm.licensePlate || !vehicleForm.vin) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      let photoUrl = selectedVehicle?.photoUrl || "";
      let photoUrls = selectedVehicle?.photoUrls || [];
      
      // Upload new photos if selected
      if (selectedVehiclePhotos.length > 0) {
        const uploadPromises = selectedVehiclePhotos.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadResponse = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            return uploadResult.url;
          } else {
            throw new Error('Failed to upload photo');
          }
        });
        
        const uploadedUrls = await Promise.all(uploadPromises);
        photoUrl = uploadedUrls[0]; // Use the first photo as main photo
        photoUrls = uploadedUrls; // Store all photo URLs
      }
      
      const vehicleData = {
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: vehicleForm.year,
        licensePlate: vehicleForm.licensePlate,
        vin: vehicleForm.vin,
        bondAmount: parseInt(vehicleForm.bondAmount) || 0,
        rentPerWeek: parseInt(vehicleForm.rentPerWeek) || 0,
        currentMileage: parseInt(vehicleForm.currentMileage) || 0,
        odoMeter: parseInt(vehicleForm.odoMeter) || 0,
        nextServiceDate: vehicleForm.nextServiceDate,
        vehicleType: vehicleForm.vehicleType,
        color: vehicleForm.color,
        fuelType: vehicleForm.fuelType,
        transmission: vehicleForm.transmission,
        status: vehicleForm.status,
        photoUrl: photoUrl,
        photoUrls: photoUrls
      };

      const response = await fetch(API_ENDPOINTS.UPDATE_VEHICLE(selectedVehicle.id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData)
      });

      if (response.ok) {
        const result = await response.json();
        // Update vehicle in the list
        setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? result.vehicle : v));
        handleCloseModal();
        setSelectedVehiclePhotos([]);
        alert('Vehicle updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update vehicle: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Network error. Please try again.');
    }
  };

  // Rental Applications Functions
  const fetchRentalApplications = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.RENTAL_APPLICATIONS);
      if (response.ok) {
        const data = await response.json();
        setRentalApplications(data);
      } else {
        console.error('Failed to fetch rental applications:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching rental applications:', error);
    }
  };

  const fetchAvailableCars = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.VEHICLES);
      if (response.ok) {
        const data = await response.json();
        // Filter only available cars
        const available = data.filter(vehicle => vehicle.status === 'available' || vehicle.status === 'pending_approval');
        setAvailableCars(available);
      } else {
        console.error('Failed to fetch available cars:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching available cars:', error);
    }
  };

  const handleViewRentalApplication = (application) => {
    setSelectedApplication(application);
    setShowRentalApplicationModal(true);
  };

  const handleApproveApplication = async () => {
    if (!selectedApplication) return;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.RENTAL_APPLICATION_BY_ID(selectedApplication.id)}?status=approved&admin_notes=${encodeURIComponent(adminNotes)}`, {
        method: 'PUT',
      });

      if (response.ok) {
        alert('Application approved successfully!');
        fetchRentalApplications(); // Refresh the list
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Error approving application');
    }
  };

  const handleRejectApplication = async () => {
    if (!selectedApplication) return;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.RENTAL_APPLICATION_BY_ID(selectedApplication.id)}?status=rejected&admin_notes=${encodeURIComponent(adminNotes)}`, {
        method: 'PUT',
      });

      if (response.ok) {
        alert('Application rejected successfully!');
        fetchRentalApplications(); // Refresh the list
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Error rejecting application');
    }
  };

  const handleSubmitDriver = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!driverForm.firstName || !driverForm.lastName || !driverForm.email || !driverForm.phone || !driverForm.licenseNumber) {
      alert('Please fill in all required fields (First Name, Last Name, Email, Phone, License Number)');
      return;
    }
    
    try {
      const driverData = {
        firstName: driverForm.firstName,
        lastName: driverForm.lastName,
        email: driverForm.email,
        phone: driverForm.phone,
        licenseNumber: driverForm.licenseNumber,
        licenseExpiry: driverForm.licenseExpiry,
        address: driverForm.address,
        emergencyContact: driverForm.emergencyContact,
        emergencyPhone: driverForm.emergencyPhone,
        selectedVehicleId: driverForm.selectedVehicleId,
        contractStartDate: driverForm.contractStartDate,
        contractEndDate: driverForm.contractEndDate,
        contractPeriod: driverForm.contractPeriod,
        bondAmount: parseInt(driverForm.bondAmount) || 0,
        weeklyRent: parseInt(driverForm.weeklyRent) || 0,
        contractSigned: driverForm.contractSigned,
        paymentReceiptUploaded: driverForm.paymentReceiptUploaded,
        paymentReceiptUrl: driverForm.paymentReceiptUrl,
        status: driverForm.status
      };

      const response = await fetch(API_ENDPOINTS.CREATE_DRIVER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverData),
      });

      if (response.ok) {
        const result = await response.json();
        setDrivers(prev => [...prev, result.driver]);
        handleCloseModal();
        fetchVehicles(); // Refresh vehicles to update availability
        alert('Driver added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to add driver: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding driver:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };



  const handleVehicleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVehiclePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit for photos)
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo size must be less than 5MB');
        e.target.value = '';
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPG, PNG, WEBP image files are allowed');
        e.target.value = '';
        return;
      }
      
      setSelectedVehiclePhoto(file);
    }
  };

  const handleMultipleVehiclePhotosSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    
    files.forEach(file => {
      // Check file size (5MB limit for photos)
      if (file.size > 5 * 1024 * 1024) {
        alert(`Photo ${file.name} is too large. Must be less than 5MB`);
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert(`Photo ${file.name} is not a valid image file. Only JPG, PNG, WEBP are allowed`);
        return;
      }
      
      validFiles.push(file);
    });
    
    // Limit to 5 photos maximum
    if (validFiles.length > 5) {
      alert('Maximum 5 photos allowed. Only the first 5 will be selected.');
      validFiles.splice(5);
    }
    
    setSelectedVehiclePhotos(validFiles);
  };

  const removeVehiclePhoto = (index) => {
    setSelectedVehiclePhotos(prev => prev.filter((_, i) => i !== index));
  };

  console.log('AdminDashboard render - loading:', loading, 'user:', user);
  
  if (loading) {
    console.log('Showing loading screen...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering main admin dashboard...');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl mr-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Transport Management
                </h1>
                <p className="text-sm text-gray-600 mt-1">Manage your vehicle fleet and drivers</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-3xl font-bold text-gray-900">{drivers.length}</p>
                <p className="text-sm text-green-600 font-medium">{drivers.filter(d => d.status === 'active').length} active</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Cars</p>
                <p className="text-3xl font-bold text-green-600">{vehicles.filter(v => v.status === 'available').length}</p>
                <p className="text-sm text-gray-500 font-medium">out of {vehicles.length} total</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Car className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Alerts</p>
                <p className="text-3xl font-bold text-yellow-600">12</p>
                <p className="text-sm text-red-600 font-medium">Requires attention</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Trips</p>
                <p className="text-3xl font-bold text-purple-600">156</p>
                <p className="text-sm text-blue-600 font-medium">in progress</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & Alerts */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Home className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={() => setShowAddDriverModal(true)}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center">
                    <Plus className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-semibold text-gray-900">Add New Driver</span>
                  </div>
                  <span className="text-lg text-blue-600 font-bold">→</span>
                </button>
                
                <button 
                  onClick={() => setShowAddVehicleModal(true)}
                  className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center">
                    <Car className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-semibold text-gray-900">Add New Vehicle</span>
                  </div>
                  <span className="text-lg text-green-600 font-bold">→</span>
                </button>
                
                <button className="w-full flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="flex items-center">
                    <Wrench className="h-5 w-5 text-yellow-600 mr-3" />
                    <span className="text-sm font-semibold text-gray-900">Schedule Service</span>
                  </div>
                  <span className="text-lg text-yellow-600 font-bold">→</span>
                </button>
                
                <button className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-semibold text-gray-900">Generate Report</span>
                  </div>
                  <span className="text-lg text-purple-600 font-bold">→</span>
                </button>
              </div>
            </div>

            {/* Urgent Alerts */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 p-2 rounded-lg mr-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Urgent Alerts</h3>
              </div>
              <div className="space-y-4">
                {drivers.filter(d => d.status === 'pending_payment').length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                      <div>
                        <p className="text-sm font-semibold text-red-800">Payment Overdue</p>
                        <p className="text-xs text-red-600">{drivers.filter(d => d.status === 'pending_payment').length} drivers pending payment</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {drivers.filter(d => d.status === 'registered').length > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-semibold text-blue-800">New Applications</p>
                        <p className="text-xs text-blue-600">{drivers.filter(d => d.status === 'registered').length} applications awaiting review</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {vehicles.filter(v => v.status === 'maintenance').length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-center">
                      <Wrench className="h-5 w-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-800">Service Due</p>
                        <p className="text-xs text-yellow-600">{vehicles.filter(v => v.status === 'maintenance').length} vehicles in maintenance</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {drivers.length === 0 && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">No Alerts</p>
                        <p className="text-xs text-green-600">All systems running smoothly</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-600" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">John Smith logged in</span>
                  <span className="text-gray-400 ml-auto">2 min ago</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">New vehicle added</span>
                  <span className="text-gray-400 ml-auto">15 min ago</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Payment received</span>
                  <span className="text-gray-400 ml-auto">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white/70 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/20">
              <nav className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'overview'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('drivers')}
                  className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'drivers'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  Drivers
                </button>
                <button
                  onClick={() => setActiveTab('vehicles')}
                  className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'vehicles'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  Vehicles
                </button>

              </nav>
            </div>

            {/* Content Based on Active Tab */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
              {activeTab === 'overview' && (
                <div className="p-8">
                  <div className="flex items-center mb-8">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
                      <div className="flex items-center mb-4">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <Car className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Fleet Status</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                          <span className="text-sm font-medium text-gray-700">Available</span>
                          <span className="text-lg font-bold text-green-600">{vehicles.filter(v => v.status === 'available').length} vehicles</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl">
                          <span className="text-sm font-medium text-gray-700">In Maintenance</span>
                          <span className="text-lg font-bold text-yellow-600">{vehicles.filter(v => v.status === 'maintenance').length} vehicles</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                          <span className="text-sm font-medium text-gray-700">Out of Service</span>
                          <span className="text-lg font-bold text-red-600">{vehicles.filter(v => v.status === 'rented').length} vehicles</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
                      <div className="flex items-center mb-4">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                          <Star className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Performance Metrics</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                          <span className="text-sm font-medium text-gray-700">Driver Satisfaction</span>
                          <span className="text-lg font-bold text-purple-600">4.7/5.0</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                          <span className="text-sm font-medium text-gray-700">On-time Delivery</span>
                          <span className="text-lg font-bold text-blue-600">96.3%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                          <span className="text-sm font-medium text-gray-700">Monthly Revenue</span>
                          <span className="text-lg font-bold text-green-600">$124,500</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Drivers</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">John Smith</span>
                          <span className="text-xs text-green-600">Active</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Sarah Johnson</span>
                          <span className="text-xs text-green-600">Active</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Mike Wilson</span>
                          <span className="text-xs text-green-600">Active</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Vehicles</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Toyota Camry 2022</span>
                          <span className="text-xs text-green-600">Available</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Honda Civic 2021</span>
                          <span className="text-xs text-yellow-600">Maintenance</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">Ford Focus 2023</span>
                          <span className="text-xs text-blue-600">Rented</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Available Cars Section */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <button
                        onClick={handleOpenAvailableCars}
                        className="flex items-center hover:scale-105 transition-transform cursor-pointer bg-blue-50 p-4 rounded-xl border-2 border-blue-200 hover:border-blue-400"
                      >
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <Car className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
                            Available Cars
                          </h3>
                          <p className="text-xs text-blue-600 font-medium">Click to view all details →</p>
                        </div>
                      </button>
                      <span className="text-sm text-gray-600">
                        {availableCars.length} cars available
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableCars.length === 0 ? (
                        <div className="col-span-full text-center py-8 bg-gray-50 rounded-xl">
                          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 mb-2">No Available Cars</h4>
                          <p className="text-sm text-gray-600">All vehicles are currently rented or in maintenance</p>
                        </div>
                      ) : (
                        availableCars.map((car) => (
                          <div key={car.id} className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-center mb-3">
                              <div className="w-12 h-8 rounded-lg overflow-hidden mr-3 border border-gray-200">
                                <img 
                                  src={`${API_ENDPOINTS.UPLOADS}${car.photoUrl}`} 
                                  alt={`${car.make} ${car.model}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="w-full h-full bg-blue-100 flex items-center justify-center" style={{ display: 'none' }}>
                                  <Car className="h-4 w-4 text-blue-600" />
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  {car.make} {car.model}
                                </h4>
                                <p className="text-xs text-gray-600">{car.year}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">License:</span>
                                <span className="font-medium">{car.licensePlate}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Bond:</span>
                                <span className="font-medium text-green-600">${car.bondAmount}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Weekly Rent:</span>
                                <span className="font-medium text-blue-600">${car.rentPerWeek}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Type:</span>
                                <span className="font-medium capitalize">{car.vehicleType}</span>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                  {car.currentMileage?.toLocaleString()} km
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Available
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'drivers' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Driver Management</h2>
                    <button 
                      onClick={handleAddDriver}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Driver
                    </button>
                  </div>

                  {/* Status Filter Tabs */}
                  <div className="flex space-x-2 mb-6">
                    <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                      All Drivers ({drivers.length})
                    </button>
                    <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      Active ({drivers.filter(d => d.status === 'active').length})
                    </button>
                    <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                      Pending ({drivers.filter(d => d.status === 'pending' || d.status === 'pending_payment').length})
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                      Applications ({drivers.filter(d => d.status === 'registered').length})
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {drivers.map((driver) => (
                      <div key={driver.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                        driver.status === 'active' ? 'bg-green-50 border-green-200' :
                        driver.status === 'pending_payment' ? 'bg-yellow-50 border-yellow-200' :
                        driver.status === 'registered' ? 'bg-blue-50 border-blue-200' :
                        driver.status === 'pending' ? 'bg-orange-50 border-orange-200' :
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                            driver.status === 'active' ? 'bg-green-100' :
                            driver.status === 'pending_payment' ? 'bg-yellow-100' :
                            driver.status === 'registered' ? 'bg-blue-100' :
                            driver.status === 'pending' ? 'bg-orange-100' :
                            'bg-gray-100'
                          }`}>
                            <Users className={`h-5 w-5 ${
                              driver.status === 'active' ? 'text-green-600' :
                              driver.status === 'pending_payment' ? 'text-yellow-600' :
                              driver.status === 'registered' ? 'text-blue-600' :
                              driver.status === 'pending' ? 'text-orange-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{driver.firstName} {driver.lastName}</p>
                            <p className="text-sm text-gray-600">Email: {driver.email} • Phone: {driver.phone}</p>
                            <p className="text-sm text-gray-600">License: {driver.licenseNumber} • Expires: {driver.licenseExpiry}</p>
                            
                            {/* Application Status for New Drivers */}
                            {driver.status === 'registered' && (
                              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                <p className="text-xs font-medium text-blue-800">New Application</p>
                                <p className="text-xs text-blue-700">Applied: {new Date(driver.createdAt).toLocaleDateString()}</p>
                                <p className="text-xs text-blue-700">Status: Awaiting Review</p>
                              </div>
                            )}
                            
                            {/* Vehicle Assignment for Active Drivers */}
                            {driver.vehicle && driver.status !== 'registered' && (
                              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                <p className="text-xs font-medium text-blue-800">Assigned Vehicle:</p>
                                <p className="text-xs text-blue-700">{driver.vehicle.make} {driver.vehicle.model} {driver.vehicle.year} ({driver.vehicle.licensePlate})</p>
                              </div>
                            )}
                            
                            {/* Contract Information for Active Drivers */}
                            {driver.contractStartDate && driver.status !== 'registered' && (
                              <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                <p className="text-xs font-medium text-green-800">Contract Period:</p>
                                <p className="text-xs text-green-700">{driver.contractPeriod} • {new Date(driver.contractStartDate).toLocaleDateString()} - {new Date(driver.contractEndDate).toLocaleDateString()}</p>
                                <p className="text-xs text-green-700">Bond: ${driver.bondAmount} • Weekly Rent: ${driver.weeklyRent}</p>
                              </div>
                            )}
                            
                            {/* Contract & Payment Status for Active Drivers */}
                            {driver.status !== 'registered' && (
                              <div className="mt-2 flex space-x-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  driver.contractSigned ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {driver.contractSigned ? '✓ Contract Signed' : '✗ Contract Pending'}
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  driver.paymentReceiptUploaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {driver.paymentReceiptUploaded ? '✓ Payment Received' : '✗ Payment Pending'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            driver.status === 'active' ? 'bg-green-100 text-green-800' :
                            driver.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                            driver.status === 'registered' ? 'bg-blue-100 text-blue-800' :
                            driver.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {driver.status === 'registered' ? 'NEW APPLICATION' : driver.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">ID: DRV-{driver.id.toString().padStart(3, '0')}</p>
                          <p className="text-xs text-gray-500">Created: {new Date(driver.createdAt).toLocaleDateString()}</p>
                          
                          {/* Action Buttons */}
                          {driver.status === 'registered' && (
                            <div className="flex space-x-2 mt-2">
                              <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors">
                                Approve
                              </button>
                              <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors">
                                Reject
                              </button>
                            </div>
                          )}
                          
                          {driver.status !== 'registered' && (
                            <div className="flex space-x-2 mt-2">
                              <button 
                                onClick={() => handleEditDriver(driver)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </button>
                              <button 
                                onClick={() => handleViewDriver(driver)}
                                className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors flex items-center"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </button>
                              <button 
                                onClick={() => handleAddDocument(driver)}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center"
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                Docs
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {drivers.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No drivers found</p>
                        <p className="text-sm text-gray-400">Add your first driver to get started</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Rental Applications Section */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <ClipboardList className="h-5 w-5 mr-2 text-blue-600" />
                        Rental Applications
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {rentalApplications.filter(app => app.status === 'pending' || app.status === 'payment_received').length} pending review
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {rentalApplications.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <ClipboardList className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <h4 className="text-sm font-medium text-gray-900 mb-1">No Applications Yet</h4>
                          <p className="text-xs text-gray-600">Rental applications will appear here when users submit them</p>
                        </div>
                      ) : (
                        rentalApplications.map((application) => (
                          <div key={application.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                            application.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                            application.status === 'payment_received' ? 'bg-blue-50 border-blue-200' :
                            application.status === 'approved' ? 'bg-green-50 border-green-200' :
                            'bg-red-50 border-red-200'
                          }`}>
                            <div className="flex items-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            application.status === 'pending' ? 'bg-yellow-100' :
                            application.status === 'payment_received' ? 'bg-blue-100' :
                            application.status === 'approved' ? 'bg-green-100' :
                            'bg-red-100'
                          }`}>
                            <ClipboardList className={`h-4 w-4 ${
                              application.status === 'pending' ? 'text-yellow-600' :
                              application.status === 'payment_received' ? 'text-blue-600' :
                              application.status === 'approved' ? 'text-green-600' :
                              'text-red-600'
                            }`} />
                          </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">
                                  {application.first_name} {application.last_name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {application.vehicle_details?.make} {application.vehicle_details?.model} {application.vehicle_details?.year}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Contract: {application.contract_period} • Submitted: {new Date(application.submitted_at).toLocaleDateString()}
                                </p>
                                {application.payment_receipt_uploaded && (
                                  <p className="text-xs text-green-600 font-medium">
                                    ✅ Payment Receipt Uploaded
                                  </p>
                                )}
                                {application.status === 'payment_received' && (
                                  <p className="text-xs text-blue-600 font-medium">
                                    ⏳ Ready for Approval
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end space-y-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                application.status === 'payment_received' ? 'bg-blue-100 text-blue-800' :
                                application.status === 'approved' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {application.status === 'pending' ? 'Pending' :
                                 application.status === 'payment_received' ? 'Payment Received' :
                                 application.status === 'approved' ? 'Approved' :
                                 'Rejected'}
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewRentalApplication(application)}
                                  className="flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'vehicles' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Vehicle Fleet</h2>
                    <button 
                      onClick={handleAddVehicle}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vehicle
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                        vehicle.status === 'available' ? 'bg-green-50 border-green-200' :
                        vehicle.status === 'maintenance' ? 'bg-yellow-50 border-yellow-200' :
                        vehicle.status === 'rented' ? 'bg-blue-50 border-blue-200' :
                        'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center">
                          {vehicle.photoUrls && vehicle.photoUrls.length > 0 ? (
                            <div className="w-16 h-12 rounded-lg overflow-hidden mr-4 border border-gray-200">
                              <ImageSlider 
                                images={vehicle.photoUrls.map(url => `${API_BASE_URL}${url}`)} 
                                autoSlide={true} 
                                interval={2000}
                              />
                            </div>
                          ) : vehicle.photoUrl ? (
                            <div className="w-16 h-12 rounded-lg overflow-hidden mr-4 border border-gray-200">
                              <img 
                                src={`${API_BASE_URL}${vehicle.photoUrl}`} 
                                alt={`${vehicle.make} ${vehicle.model}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className={`w-full h-full flex items-center justify-center ${
                                vehicle.status === 'available' ? 'bg-green-100' :
                                vehicle.status === 'maintenance' ? 'bg-yellow-100' :
                                vehicle.status === 'rented' ? 'bg-blue-100' :
                                'bg-red-100'
                              }`} style={{ display: 'none' }}>
                                <Car className={`h-5 w-5 ${
                                  vehicle.status === 'available' ? 'text-green-600' :
                                  vehicle.status === 'maintenance' ? 'text-yellow-600' :
                                  vehicle.status === 'rented' ? 'text-blue-600' :
                                  'text-red-600'
                                }`} />
                              </div>
                            </div>
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                              vehicle.status === 'available' ? 'bg-green-100' :
                              vehicle.status === 'maintenance' ? 'bg-yellow-100' :
                              vehicle.status === 'rented' ? 'bg-blue-100' :
                              'bg-red-100'
                            }`}>
                              <Car className={`h-5 w-5 ${
                                vehicle.status === 'available' ? 'text-green-600' :
                                vehicle.status === 'maintenance' ? 'text-yellow-600' :
                                vehicle.status === 'rented' ? 'text-blue-600' :
                                'text-red-600'
                              }`} />
                            </div>
                          )}
                                                      <div>
                              <p className="font-medium text-gray-900">{vehicle.make} {vehicle.model} {vehicle.year}</p>
                              <p className="text-sm text-gray-600">License: {vehicle.licensePlate} • Bond: ${vehicle.bondAmount} • Rent: ${vehicle.rentPerWeek}/week</p>
                              <p className="text-xs text-gray-500">ODO: {vehicle.odoMeter.toLocaleString()} km • Next service: {new Date(vehicle.nextServiceDate).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">Type: {vehicle.vehicleType} • Color: {vehicle.color} • Fuel: {vehicle.fuelType}</p>
                              {vehicle.ownerName && (
                                <p className="text-xs text-gray-500">Owner: {vehicle.ownerName}</p>
                              )}
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end space-y-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                            vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            vehicle.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                            vehicle.status === 'pending_approval' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {vehicle.status === 'available' ? 'Available' :
                             vehicle.status === 'maintenance' ? 'Maintenance' :
                             vehicle.status === 'rented' ? 'Rented' :
                             vehicle.status === 'pending_approval' ? 'Pending Approval' :
                             'Out of Service'}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewVehicle(vehicle)}
                              className="flex items-center px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditVehicle(vehicle)}
                              className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Car className="h-5 w-5 mr-2 text-green-600" />
                  Add New Vehicle
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitVehicle} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                    <input
                      type="text"
                      name="make"
                      value={vehicleForm.make}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Toyota"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                    <input
                      type="text"
                      name="model"
                      value={vehicleForm.model}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Camry"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                    <input
                      type="number"
                      name="year"
                      value={vehicleForm.year}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 2022"
                      min="1990"
                      max="2024"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
                    <input
                      type="text"
                      name="licensePlate"
                      value={vehicleForm.licensePlate}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., ABC-123"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">VIN Number *</label>
                    <input
                      type="text"
                      name="vin"
                      value={vehicleForm.vin}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="17-character VIN"
                      maxLength="17"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="text"
                      name="color"
                      value={vehicleForm.color}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Silver"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                    <input
                      type="text"
                      name="ownerName"
                      value={vehicleForm.ownerName}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., John Smith"
                    />
                  </div>
                </div>

                {/* Financial & Technical Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Financial & Technical</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bond Amount ($) *</label>
                    <input
                      type="number"
                      name="bondAmount"
                      value={vehicleForm.bondAmount}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 500"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rent per Week ($) *</label>
                    <input
                      type="number"
                      name="rentPerWeek"
                      value={vehicleForm.rentPerWeek}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 150"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Mileage (km) *</label>
                    <input
                      type="number"
                      name="currentMileage"
                      value={vehicleForm.currentMileage}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 45230"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ODO Meter Reading (km) *</label>
                    <input
                      type="number"
                      name="odoMeter"
                      value={vehicleForm.odoMeter}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 45230"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Service Date *</label>
                    <input
                      type="date"
                      name="nextServiceDate"
                      value={vehicleForm.nextServiceDate}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={vehicleForm.vehicleType}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="van">Van</option>
                      <option value="truck">Truck</option>
                      <option value="hatchback">Hatchback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                    <select
                      name="fuelType"
                      value={vehicleForm.fuelType}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                    <select
                      name="transmission"
                      value={vehicleForm.transmission}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={vehicleForm.status}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="available">Available</option>
                      <option value="maintenance">In Maintenance</option>
                      <option value="rented">Rented</option>
                      <option value="out_of_service">Out of Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Photos (Multiple)</label>
                    <input
                      type="file"
                      multiple
                      onChange={handleMultipleVehiclePhotosSelect}
                      accept=".jpg,.jpeg,.png,.webp"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Accepted formats: JPG, PNG, WEBP (Max 5MB each, up to 5 photos)
                    </p>
                    
                    {/* Selected Photos Preview */}
                    {selectedVehiclePhotos.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Selected Photos ({selectedVehiclePhotos.length}/5):</p>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedVehiclePhotos.map((photo, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(photo)}
                                alt={`Vehicle photo ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeVehiclePhoto(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                                {(photo.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Edit className="h-5 w-5 mr-2 text-blue-600" />
                  Edit Vehicle
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateVehicle} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                    <input
                      type="text"
                      name="make"
                      value={vehicleForm.make}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Toyota"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                    <input
                      type="text"
                      name="model"
                      value={vehicleForm.model}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Camry"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                    <input
                      type="number"
                      name="year"
                      value={vehicleForm.year}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 2022"
                      min="1990"
                      max="2024"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
                    <input
                      type="text"
                      name="licensePlate"
                      value={vehicleForm.licensePlate}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., ABC-123"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">VIN Number *</label>
                    <input
                      type="text"
                      name="vin"
                      value={vehicleForm.vin}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="17-character VIN"
                      maxLength="17"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="text"
                      name="color"
                      value={vehicleForm.color}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Silver"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                    <input
                      type="text"
                      name="ownerName"
                      value={vehicleForm.ownerName}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., John Smith"
                    />
                  </div>
                </div>

                {/* Financial & Technical Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Financial & Technical</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bond Amount ($) *</label>
                    <input
                      type="number"
                      name="bondAmount"
                      value={vehicleForm.bondAmount}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 500"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rent per Week ($) *</label>
                    <input
                      type="number"
                      name="rentPerWeek"
                      value={vehicleForm.rentPerWeek}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 150"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Mileage (km) *</label>
                    <input
                      type="number"
                      name="currentMileage"
                      value={vehicleForm.currentMileage}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 45230"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ODO Meter Reading (km) *</label>
                    <input
                      type="number"
                      name="odoMeter"
                      value={vehicleForm.odoMeter}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 45230"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Service Date *</label>
                    <input
                      type="date"
                      name="nextServiceDate"
                      value={vehicleForm.nextServiceDate}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={vehicleForm.vehicleType}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="van">Van</option>
                      <option value="truck">Truck</option>
                      <option value="hatchback">Hatchback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                    <select
                      name="fuelType"
                      value={vehicleForm.fuelType}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                    <select
                      name="transmission"
                      value={vehicleForm.transmission}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={vehicleForm.status}
                      onChange={handleVehicleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="available">Available</option>
                      <option value="maintenance">In Maintenance</option>
                      <option value="rented">Rented</option>
                      <option value="out_of_service">Out of Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Photo</label>
                    <input
                      type="file"
                      onChange={handleVehiclePhotoSelect}
                      accept=".jpg,.jpeg,.png,.webp"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Accepted formats: JPG, PNG, WEBP (Max 5MB) - Leave empty to keep current photo
                    </p>
                    {selectedVehiclePhoto && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-800">
                          Selected: {selectedVehiclePhoto.name} ({(selectedVehiclePhoto.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    )}
                    {selectedVehicle?.photoUrl && !selectedVehiclePhoto && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">
                          Current photo: {selectedVehicle.photoName || 'Vehicle photo'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Update Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Vehicle Modal */}
      {showViewVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-gray-600" />
                  Vehicle Details
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Vehicle Photo */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Vehicle Photo</h3>
                  {selectedVehicle?.photoUrl ? (
                    <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
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
                        <Car className="h-16 w-16 text-gray-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <Car className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No photo available</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedVehicle?.photoName && (
                    <div className="text-sm text-gray-600">
                      <p><strong>Photo:</strong> {selectedVehicle.photoName}</p>
                      {selectedVehicle?.photoSize && (
                        <p><strong>Size:</strong> {(selectedVehicle.photoSize / 1024 / 1024).toFixed(2)} MB</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Vehicle Information */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Make</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVehicle?.make}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Model</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVehicle?.model}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Year</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVehicle?.year}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Color</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVehicle?.color}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVehicle?.ownerName || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">License Plate</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">{selectedVehicle?.licensePlate}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">VIN Number</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">{selectedVehicle?.vin}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Financial Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bond Amount</label>
                        <p className="mt-1 text-sm text-gray-900">${selectedVehicle?.bondAmount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Rent per Week</label>
                        <p className="mt-1 text-sm text-gray-900">${selectedVehicle?.rentPerWeek?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Technical Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Technical Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">{selectedVehicle?.vehicleType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">{selectedVehicle?.fuelType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Transmission</label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">{selectedVehicle?.transmission}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                          selectedVehicle?.status === 'available' ? 'bg-green-100 text-green-800' :
                          selectedVehicle?.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          selectedVehicle?.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedVehicle?.status === 'available' ? 'Available' :
                           selectedVehicle?.status === 'maintenance' ? 'Maintenance' :
                           selectedVehicle?.status === 'rented' ? 'Rented' :
                           'Out of Service'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Current Mileage</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVehicle?.currentMileage?.toLocaleString()} km</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">ODO Meter</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVehicle?.odoMeter?.toLocaleString()} km</p>
                      </div>
                    </div>
                  </div>

                  {/* Service Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Service Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Next Service Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedVehicle?.nextServiceDate ? new Date(selectedVehicle.nextServiceDate).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Record Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Created</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVehicle?.createdAt ? new Date(selectedVehicle.createdAt).toLocaleString() : 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVehicle?.updatedAt ? new Date(selectedVehicle.updatedAt).toLocaleString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleEditVehicle(selectedVehicle)}
                  className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Vehicle
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {showAddDriverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Driver</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitDriver} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={driverForm.firstName}
                      onChange={handleDriverInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., John"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={driverForm.lastName}
                      onChange={handleDriverInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Smith"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={driverForm.email}
                      onChange={handleDriverInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., john.smith@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={driverForm.phone}
                      onChange={handleDriverInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., +1-555-0123"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={driverForm.licenseNumber}
                      onChange={handleDriverInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., DL123456789"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry Date</label>
                    <input
                      type="date"
                      name="licenseExpiry"
                      value={driverForm.licenseExpiry}
                      onChange={handleDriverInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={driverForm.address}
                      onChange={handleDriverInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Full address"
                    />
                  </div>
                </div>

                {/* Emergency Contact & Vehicle Assignment */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Emergency Contact & Assignment</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={driverForm.emergencyContact}
                      onChange={handleDriverInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Jane Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={driverForm.emergencyPhone}
                      onChange={handleDriverInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., +1-555-0124"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Vehicle</label>
                    <select
                      name="selectedVehicleId"
                      value={driverForm.selectedVehicleId}
                      onChange={handleDriverInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a vehicle (optional)</option>
                      {vehicles.filter(v => v.status === 'available').map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} {vehicle.year} - {vehicle.licensePlate}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Start Date</label>
                    <input
                      type="date"
                      name="contractStartDate"
                      value={driverForm.contractStartDate}
                      onChange={handleDriverInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract End Date</label>
                    <input
                      type="date"
                      name="contractEndDate"
                      value={driverForm.contractEndDate}
                      onChange={handleDriverInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Period</label>
                    <select
                      name="contractPeriod"
                      value={driverForm.contractPeriod}
                      onChange={handleDriverInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select period</option>
                      <option value="3 months">3 months</option>
                      <option value="6 months">6 months</option>
                      <option value="12 months">12 months</option>
                      <option value="24 months">24 months</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bond Amount ($)</label>
                    <input
                      type="number"
                      name="bondAmount"
                      value={driverForm.bondAmount}
                      onChange={handleDriverInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Rent ($)</label>
                    <input
                      type="number"
                      name="weeklyRent"
                      value={driverForm.weeklyRent}
                      onChange={handleDriverInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 150"
                      min="0"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="contractSigned"
                        checked={driverForm.contractSigned}
                        onChange={handleDriverInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Contract Signed</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="paymentReceiptUploaded"
                        checked={driverForm.paymentReceiptUploaded}
                        onChange={handleDriverInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Payment Receipt Uploaded</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={driverForm.status}
                      onChange={handleDriverInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="pending_payment">Pending Payment</option>
                      <option value="registered">Registered</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Driver Modal */}
      {showViewDriverModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Driver Profile - {selectedDriver.firstName} {selectedDriver.lastName}</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDriver.firstName} {selectedDriver.lastName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDriver.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDriver.phone}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">License Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDriver.licenseNumber}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">License Expiry</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDriver.licenseExpiry}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDriver.address}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDriver.emergencyContact} - {selectedDriver.emergencyPhone}</p>
                  </div>
                </div>

                {/* Contract & Vehicle Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Contract & Vehicle</h3>
                  
                  {selectedDriver.vehicle && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assigned Vehicle</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedDriver.vehicle.make} {selectedDriver.vehicle.model} {selectedDriver.vehicle.year}</p>
                      <p className="text-xs text-gray-500">License: {selectedDriver.vehicle.licensePlate}</p>
                    </div>
                  )}

                  {selectedDriver.contractStartDate && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contract Period</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedDriver.contractPeriod}</p>
                        <p className="text-xs text-gray-500">{selectedDriver.contractStartDate} to {selectedDriver.contractEndDate}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Financial Terms</label>
                        <p className="mt-1 text-sm text-gray-900">Bond: ${selectedDriver.bondAmount} | Weekly Rent: ${selectedDriver.weeklyRent}</p>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedDriver.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedDriver.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                      selectedDriver.status === 'registered' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedDriver.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contract & Payment Status</label>
                    <div className="mt-1 flex space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedDriver.contractSigned ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedDriver.contractSigned ? '✓ Contract Signed' : '✗ Contract Pending'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedDriver.paymentReceiptUploaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedDriver.paymentReceiptUploaded ? '✓ Payment Received' : '✗ Payment Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                  <button 
                    onClick={() => handleAddDocument(selectedDriver)}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Add Document
                  </button>
                </div>

                {selectedDriver.documents && selectedDriver.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedDriver.documents.map((doc) => (
                      <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <File className="h-5 w-5 text-blue-600 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{documentTypes[doc.documentType] || doc.documentType}</p>
                              <p className="text-xs text-gray-500">{doc.fileName}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Uploaded:</span>
                            <span className="text-gray-900">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          </div>
                          
                          {doc.expiryDate && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Expires:</span>
                              <span className={`${new Date(doc.expiryDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                                {new Date(doc.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Status:</span>
                            <span className={`${
                              doc.status === 'active' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                        </div>

                        {/* Document Access Control */}
                        {selectedDriver.paymentReceiptUploaded ? (
                          <div className="mt-3 flex space-x-2">
                            <button 
                              onClick={() => window.open(`http://localhost:8000/api/documents/${selectedDriver.id}/${doc.id}/download`, '_blank')}
                              className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </button>
                            <button 
                              onClick={() => window.open(`http://localhost:8000${doc.fileUrl}`, '_blank')}
                              className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                            >
                              View
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-xs text-yellow-800 text-center">
                              ⚠️ Payment required to access documents
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No documents uploaded</p>
                    <p className="text-sm text-gray-400">Upload documents to share with the driver</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showDocumentModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add Document - {selectedDriver.firstName} {selectedDriver.lastName}</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitDocument} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                  <select
                    name="documentType"
                    value={documentForm.documentType}
                    onChange={handleDocumentInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select document type</option>
                    {Object.entries(documentTypes).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select File *</label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                  {selectedFile && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={documentForm.expiryDate}
                    onChange={handleDocumentInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rental Application Modal */}
      {showRentalApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2 text-blue-600" />
                  Rental Application Details
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Applicant Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Applicant Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedApplication.first_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedApplication.last_name}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedApplication.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedApplication.phone}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedApplication.address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedApplication.license_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedApplication.license_expiry}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedApplication.emergency_contact}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedApplication.emergency_phone}</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Vehicle Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedApplication.vehicle_details?.make}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedApplication.vehicle_details?.model}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedApplication.vehicle_details?.year}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedApplication.vehicle_details?.licensePlate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bond Amount</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">${selectedApplication.vehicle_details?.bondAmount}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Rent</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">${selectedApplication.vehicle_details?.rentPerWeek}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Period</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedApplication.contract_period}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedApplication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedApplication.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedApplication.status === 'pending' ? 'Pending' :
                       selectedApplication.status === 'approved' ? 'Approved' :
                       'Rejected'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Submitted Date</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{new Date(selectedApplication.submitted_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Add notes about this application..."
                />
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === 'pending' && (
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectApplication}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <XSquare className="h-4 w-4 mr-2" />
                    Reject Application
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveApplication}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Approve Application
                  </button>
                </div>
              )}

              {selectedApplication.status !== 'pending' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        <strong>Processed by:</strong> {selectedApplication.processed_by || 'Admin'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Processed on:</strong> {selectedApplication.processed_at ? new Date(selectedApplication.processed_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Available Cars Page */}
      {showAvailableCarsPage && (
        <AvailableCarsPage onBack={handleCloseAvailableCars} />
      )}
    </div>
  );
}

export default AdminDashboard;
