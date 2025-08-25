import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  Users, 
  FileText, 
  AlertTriangle, 
  DollarSign, 
  Wrench,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  X
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('applications');
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showDriverDetails, setShowDriverDetails] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState('');
  const [previewDocTitle, setPreviewDocTitle] = useState('');
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
    bondAmount: '1000',
    weeklyRent: '200',
    licenseFront: null,
    licenseBack: null,
    bondProof: null,
    rentProof: null,
    contractDoc: null,
  });
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    vin: '',
    bondAmount: '1000',
    rentPerWeek: '200',
    currentMileage: '',
    odoMeter: '',
    nextServiceDate: '',
    vehicleType: 'sedan',
    color: '',
    fuelType: 'petrol',
    transmission: 'automatic',
    status: 'available',
    ownerName: '',
    photo: null,
    vehiclePhoto: null,
    contractDoc: null,
    contractExpiry: '',
    redBookDoc: null,
    redBookExpiry: '',
    registrationDoc: null,
    registrationExpiry: '',
    insuranceDoc: null,
    insuranceExpiry: '',
    cpvDoc: null,
    cpvExpiry: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Force default tab to "applications" on initial mount
  useEffect(() => {
    setActiveTab('applications');
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching data...');
      const [vehiclesRes, driversRes, usersRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/drivers'),
        fetch('/api/users')
      ]);

      console.log('Vehicles response:', vehiclesRes.status, vehiclesRes.ok);
      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json();
        console.log('Vehicles data:', vehiclesData);
        setVehicles(vehiclesData);
      }

      console.log('Drivers response:', driversRes.status, driversRes.ok);
      if (driversRes.ok) {
        const driversData = await driversRes.json();
        console.log('Drivers data:', driversData);
        setDrivers(driversData);
      }

      console.log('Users response:', usersRes.status, usersRes.ok);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        console.log('Users data:', usersData);
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/admin-login');
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'vehiclePhoto' || name === 'contractDoc' || name === 'redBookDoc' || name === 'registrationDoc' || name === 'insuranceDoc' || name === 'cpvDoc') {
      setFormData(prev => ({
        ...prev,
        [name]: files ? files[0] : null
      }));
      } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Add basic fields
      if (formData.make) formDataToSend.append('make', formData.make);
      if (formData.model) formDataToSend.append('model', formData.model);
      if (formData.year) formDataToSend.append('year', formData.year);
      if (formData.licensePlate) formDataToSend.append('licensePlate', formData.licensePlate);
      if (formData.color) formDataToSend.append('color', formData.color);
      
      // Add additional fields
      if (formData.vin) formDataToSend.append('vin', formData.vin);
      if (formData.bondAmount) formDataToSend.append('bondAmount', formData.bondAmount);
      if (formData.rentPerWeek) formDataToSend.append('rentPerWeek', formData.rentPerWeek);
      if (formData.currentMileage) formDataToSend.append('currentMileage', formData.currentMileage);
      if (formData.odoMeter) formDataToSend.append('odoMeter', formData.odoMeter);
      if (formData.nextServiceDate) formDataToSend.append('nextServiceDate', formData.nextServiceDate);
      if (formData.vehicleType) formDataToSend.append('vehicleType', formData.vehicleType);
      if (formData.fuelType) formDataToSend.append('fuelType', formData.fuelType);
      if (formData.transmission) formDataToSend.append('transmission', formData.transmission);
      if (formData.status) formDataToSend.append('status', formData.status);
      if (formData.ownerName) formDataToSend.append('ownerName', formData.ownerName);
      
      // Add vehicle photo if exists
      if (formData.vehiclePhoto) {
        formDataToSend.append('vehiclePhoto', formData.vehiclePhoto);
      }
      
      // Add document files if they exist
      if (formData.contractDoc) formDataToSend.append('contractDoc', formData.contractDoc);
      if (formData.redBookDoc) formDataToSend.append('redBookDoc', formData.redBookDoc);
      if (formData.registrationDoc) formDataToSend.append('registrationDoc', formData.registrationDoc);
      if (formData.insuranceDoc) formDataToSend.append('insuranceDoc', formData.insuranceDoc);
      if (formData.cpvDoc) formDataToSend.append('cpvDoc', formData.cpvDoc);

      // Add expiry dates
      if (formData.contractExpiry) formDataToSend.append('contractExpiry', formData.contractExpiry);
      if (formData.redBookExpiry) formDataToSend.append('redBookExpiry', formData.redBookExpiry);
      if (formData.registrationExpiry) formDataToSend.append('registrationExpiry', formData.registrationExpiry);
      if (formData.insuranceExpiry) formDataToSend.append('insuranceExpiry', formData.insuranceExpiry);
      if (formData.cpvExpiry) formDataToSend.append('cpvExpiry', formData.cpvExpiry);

      const url = editingVehicle 
        ? `/api/vehicles/${editingVehicle.id}` 
        : '/api/vehicles';
      
      const method = editingVehicle ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (response.ok) {
        setShowAddModal(false);
        setEditingVehicle(null);
        setFormData({
          make: '', model: '', year: '', licensePlate: '', vin: '', bondAmount: '1000', rentPerWeek: '200', 
          currentMileage: '', odoMeter: '', nextServiceDate: '', vehicleType: 'sedan', color: '', 
          fuelType: 'petrol', transmission: 'automatic', status: 'available', ownerName: '', 
          photo: null, vehiclePhoto: null,
          contractDoc: null, contractExpiry: '',
          redBookDoc: null, redBookExpiry: '',
          registrationDoc: null, registrationExpiry: '',
          insuranceDoc: null, insuranceExpiry: '',
          cpvDoc: null, cpvExpiry: ''
        });
        fetchData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving vehicle');
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
            setFormData({
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      licensePlate: vehicle.licensePlate || '',
      vin: vehicle.vin || '',
          bondAmount: vehicle.bondAmount || '1000',
          rentPerWeek: vehicle.rentPerWeek || '200',
      currentMileage: vehicle.currentMileage || '',
      odoMeter: vehicle.odoMeter || '',
      nextServiceDate: vehicle.nextServiceDate || '',
      vehicleType: vehicle.vehicleType || 'sedan',
      color: vehicle.color || '',
      fuelType: vehicle.fuelType || 'petrol',
      transmission: vehicle.transmission || 'automatic',
      status: vehicle.status || 'available',
          ownerName: vehicle.ownerName || '',
          photo: null,
          vehiclePhoto: null,
          contractDoc: null,
          contractExpiry: vehicle.contractExpiry || '',
          redBookDoc: null,
          redBookExpiry: vehicle.redBookExpiry || '',
          registrationDoc: null,
          registrationExpiry: vehicle.registrationExpiry || '',
          insuranceDoc: null,
          insuranceExpiry: vehicle.insuranceExpiry || '',
          cpvDoc: null,
          cpvExpiry: vehicle.cpvExpiry || ''
        });
    setShowAddModal(true);
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const response = await fetch(`/api/vehicles/${vehicleId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchData();
      } else {
          alert('Error deleting vehicle');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting vehicle');
      }
    }
  };

  const handleUpdateVehicleStatus = async (vehicle, newStatus) => {
    try {
      const formDataToSend = new FormData();
      // minimally required fields for update
      formDataToSend.append('make', vehicle.make || '');
      formDataToSend.append('model', vehicle.model || '');
      formDataToSend.append('year', vehicle.year || '');
      formDataToSend.append('licensePlate', vehicle.licensePlate || '');
      if (vehicle.vin) formDataToSend.append('vin', vehicle.vin);
      if (vehicle.color) formDataToSend.append('color', vehicle.color);
      if (vehicle.rentPerWeek) formDataToSend.append('rentPerWeek', vehicle.rentPerWeek);
      if (vehicle.currentMileage) formDataToSend.append('currentMileage', vehicle.currentMileage);
      if (vehicle.odoMeter) formDataToSend.append('odoMeter', vehicle.odoMeter);
      if (vehicle.nextServiceDate) formDataToSend.append('nextServiceDate', vehicle.nextServiceDate);
      if (vehicle.vehicleType) formDataToSend.append('vehicleType', vehicle.vehicleType);
      if (vehicle.fuelType) formDataToSend.append('fuelType', vehicle.fuelType);
      if (vehicle.transmission) formDataToSend.append('transmission', vehicle.transmission);
      if (vehicle.ownerName) formDataToSend.append('ownerName', vehicle.ownerName);
      formDataToSend.append('status', newStatus);

      const res = await fetch(`/api/vehicles/${vehicle.id}`, { method: 'PUT', body: formDataToSend });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update status');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const handleApplicationAction = async (applicationId, action) => {
    try {
      const response = await fetch(`/api/drivers/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: action === 'approve' ? 'approved' : 'rejected',
          actionDate: new Date().toISOString()
        }),
      });

      if (response.ok) {
        fetchData();
        alert(`Application ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error ${action}ing application`);
    }
  };

  const handleEditDriver = (driver) => {
    // TODO: Implement driver editing functionality
    alert('Driver editing functionality will be implemented soon!');
  };

  const handleDeleteDriver = async (driverId) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        const response = await fetch(`/api/drivers/${driverId}`, {
          method: 'DELETE',
      });

      if (response.ok) {
          fetchData();
          alert('Driver deleted successfully!');
      } else {
          alert('Error deleting driver');
      }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting driver');
      }
    }
  };

  const handleSendDocuments = async (driver) => {
    try {
      const response = await fetch(`/api/drivers/${driver.id}/send-documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: driver.id,
          email: driver.email,
          firstName: driver.firstName,
          lastName: driver.lastName
        }),
      });

      if (response.ok) {
        alert('Documents sent successfully to ' + driver.email);
      } else {
        const error = await response.json();
        alert(`Error sending documents: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending documents');
    }
  };

  const handleViewDriverDetails = (driver) => {
    console.log('Viewing driver details:', driver);
    setSelectedDriver(driver);
    setShowDriverDetails(true);
  };

  const handleViewApplicationDetails = (application) => {
    console.log('Viewing application details:', application);
    setSelectedDriver(application);
    setShowDriverDetails(true);
  };

  const openPreview = (url, title) => {
    if (!url) return;
    setPreviewDocUrl(url);
    setPreviewDocTitle(title || 'Document');
    setShowDocPreview(true);
  };

  const downloadFile = (url, filename) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const getStats = () => {
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'available').length;
    const rentedVehicles = vehicles.filter(v => v.status === 'rented').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
    const pendingApplications = drivers.filter(d => d.status === 'pending_approval').length;
    const totalDrivers = drivers.filter(d => d.status === 'approved').length;
    const totalPayments = drivers.filter(d => d.status === 'approved').length;
    const expiringDocuments = drivers.filter(d => {
      // Check for documents expiring in next 30 days
      return d.documents && d.documents.some(doc => {
        const expiryDate = new Date(doc.expiryDate);
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays > 0;
      });
    }).length + vehicles.filter(v => {
      // Check for vehicle documents expiring in next 30 days
      const today = new Date();
      return (v.contractExpiry && new Date(v.contractExpiry) - today <= 30 * 24 * 60 * 60 * 1000 && new Date(v.contractExpiry) > today) ||
             (v.redBookExpiry && new Date(v.redBookExpiry) - today <= 30 * 24 * 60 * 60 * 1000 && new Date(v.redBookExpiry) > today) ||
             (v.registrationExpiry && new Date(v.registrationExpiry) - today <= 30 * 24 * 60 * 60 * 1000 && new Date(v.registrationExpiry) > today) ||
             (v.insuranceExpiry && new Date(v.insuranceExpiry) - today <= 30 * 24 * 60 * 60 * 1000 && new Date(v.insuranceExpiry) > today) ||
             (v.cpvExpiry && new Date(v.cpvExpiry) - today <= 30 * 24 * 60 * 60 * 1000 && new Date(v.cpvExpiry) > today);
    }).length;

    return {
      totalVehicles,
      availableVehicles,
      rentedVehicles,
      maintenanceVehicles,
      pendingApplications,
      totalDrivers,
      totalPayments,
      expiringDocuments
    };
  };

  const stats = getStats();

  const renderContent = () => {
    switch (activeTab) {
      case 'vehicles':
  return (
          <div className="space-y-6">
          <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Vehicle Management</h2>
            <button
              onClick={() => {
                  setEditingVehicle(null);
                  setFormData({
                    make: '', model: '', year: '', licensePlate: '', color: '',
                    dailyRate: '', weeklyRate: '', monthlyRate: '', photo: null
                  });
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
            </button>
        </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            {vehicle.photoUrl ? (
                              <img 
                                src={vehicle.photoUrl} 
                                alt={`${vehicle.make} ${vehicle.model}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Car className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                      </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.make} {vehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vehicle.year} • {vehicle.color} • {vehicle.licensePlate}
                            </div>
                      </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>Bond: ${vehicle.bondAmount || 0}</div>
                          <div>Weekly: ${vehicle.rentPerWeek || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                            onClick={() => handleEdit(vehicle)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                            <Edit className="w-4 h-4" />
                            </button>
                            <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="text-red-600 hover:text-red-900"
                      >
                            <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                            onClick={() => handleUpdateVehicleStatus(vehicle, vehicle.status === 'maintenance' ? 'available' : 'maintenance')}
                            className="ml-3 px-2 py-1 text-xs rounded-md border hover:bg-gray-50"
                            title={vehicle.status === 'maintenance' ? 'Mark Available' : 'Mark Maintenance'}
                              >
                            {vehicle.status === 'maintenance' ? 'Available' : 'Maintenance'}
                              </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                  </div>
                </div>
          </div>
        );

      case 'maintenance':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Maintenance Management</h2>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center text-gray-500">
                <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No maintenance records found</p>
                <p className="text-sm">Maintenance tracking will be available soon</p>
              </div>
            </div>
                  </div>
        );

      case 'applications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">New Applications</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal Details</th>
                      <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact & Address</th>
                      <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle & Contract</th>
                      <th className="hidden xl:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment & Dates</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drivers.filter(d => d.status === 'pending_approval').map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {application.firstName} {application.lastName}
                  </div>
                              <div className="text-xs text-gray-500">
                                ID: {application.id}
                  </div>
                </div>
                            <div className="text-xs text-gray-600">
                              <div>📧 {application.email}</div>
                              <div>📱 {application.phone}</div>
              </div>
                  </div>
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Address:</span><br/>
                              {application.address}
                  </div>
                            <div>
                              <span className="font-medium">Emergency Contact:</span><br/>
                              {application.emergencyContact} ({application.emergencyPhone})
                </div>
              </div>
                        </td>
                        <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2 text-xs">
                            {application.vehicleMake && application.vehicleModel ? (
                              <div>
                                <div className="font-medium text-gray-900">
                                  🚗 {application.vehicleMake} {application.vehicleModel}
                  </div>
                                {application.vehicleLicensePlate && (
                                  <div className="text-gray-600">Plate: {application.vehicleLicensePlate}</div>
                                )}
                                {application.vehicleColor && (
                                  <div className="text-gray-600">Color: {application.vehicleColor}</div>
                                )}
                                {application.vehicleYear && (
                                  <div className="text-gray-600">Year: {application.vehicleYear}</div>
                                )}
                  </div>
            ) : (
                              <span className="text-gray-400">No vehicle selected</span>
                            )}
                            <div className="text-gray-600">
                              <div>📅 Contract: {application.contractPeriod}</div>
                              <div>💳 Bond: ${application.bondAmount}</div>
                              <div>💰 Weekly: ${application.weeklyRent}</div>
                </div>
              </div>
                          </td>
                        <td className="hidden xl:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="font-medium text-gray-900">Joined Date:</span><br/>
                              <span className="text-gray-600">
                                {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
            </div>
                            <div>
                              <span className="font-medium text-gray-900">Next Rent Date:</span><br/>
                              <span className="text-gray-600">
                                {application.nextRentDate ? new Date(application.nextRentDate).toLocaleDateString() : 'Weekly'}
                              </span>
                </div>
                            <div>
                              <span className="font-medium text-gray-900">Documents:</span>
                              <div className="mt-2 grid grid-cols-3 gap-1 max-w-[280px]">
                                {/* License Preview */}
                                { (application.licenseFrontUrl || application.licenseFront) && (
                                  ((application.licenseFrontUrl || application.licenseFront).startsWith('data:') || /\.(png|jpg|jpeg|webp)$/i.test(application.licenseFront || '')) ? (
                                    <div className="rounded-md overflow-hidden border">
                                      <img
                                        src={(application.licenseFrontUrl || '').startsWith('data:') ? application.licenseFrontUrl : (application.licenseFront ? `/uploads/${application.licenseFront}` : '')}
                                        alt="License"
                                        className="w-full h-16 object-cover"
                                        onClick={() => openPreview(((application.licenseFrontUrl || '').startsWith('data:') ? application.licenseFrontUrl : (application.licenseFront ? `/uploads/${application.licenseFront}` : '')), 'License')}
                                      />
                                      <div className="px-1 py-0.5 text-[10px] text-center bg-blue-50 text-blue-700">Lic</div>
              </div>
            ) : (
                                    <button
                                      type="button"
                                      onClick={() => openPreview((application.licenseFrontUrl || `/uploads/${application.licenseFront}`), 'License')}
                                      className="px-2 py-1 text-[11px] rounded-md bg-blue-50 text-blue-700"
                                    >📄 Lic</button>
                                  )
                                )}
                                {/* Bond Preview */}
                                {(application.bondProofUrl || application.bondProof) && (
                                  ((application.bondProofUrl || application.bondProof).startsWith('data:') || /\.(png|jpg|jpeg|webp)$/i.test(application.bondProof || '')) ? (
                                    <div className="rounded-md overflow-hidden border">
                                      <img
                                        src={(application.bondProofUrl || '').startsWith('data:') ? application.bondProofUrl : (application.bondProof ? `/uploads/${application.bondProof}` : '')}
                                        alt="Bond"
                                        className="w-full h-16 object-cover"
                                        onClick={() => openPreview(((application.bondProofUrl || '').startsWith('data:') ? application.bondProofUrl : (application.bondProof ? `/uploads/${application.bondProof}` : '')), 'Bond Proof')}
                                      />
                                      <div className="px-1 py-0.5 text-[10px] text-center bg-green-50 text-green-700">Bond</div>
                </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => openPreview((application.bondProofUrl || `/uploads/${application.bondProof}`), 'Bond Proof')}
                                      className="px-2 py-1 text-[11px] rounded-md bg-green-50 text-green-700"
                                    >💰 Bond</button>
                                  )
                                )}
                                {/* Rent Preview */}
                                {(application.rentProofUrl || application.rentProof) && (
                                  ((application.rentProofUrl || application.rentProof).startsWith('data:') || /\.(png|jpg|jpeg|webp)$/i.test(application.rentProof || '')) ? (
                                    <div className="rounded-md overflow-hidden border">
                                      <img
                                        src={(application.rentProofUrl || '').startsWith('data:') ? application.rentProofUrl : (application.rentProof ? `/uploads/${application.rentProof}` : '')}
                                        alt="Rent"
                                        className="w-full h-16 object-cover"
                                        onClick={() => openPreview(((application.rentProofUrl || '').startsWith('data:') ? application.rentProofUrl : (application.rentProof ? `/uploads/${application.rentProof}` : '')), 'Rent Proof')}
                                      />
                                      <div className="px-1 py-0.5 text-[10px] text-center bg-purple-50 text-purple-700">Rent</div>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => openPreview((application.rentProofUrl || `/uploads/${application.rentProof}`), 'Rent Proof')}
                                      className="px-2 py-1 text-[11px] rounded-md bg-purple-50 text-purple-700"
                                    >💳 Rent</button>
                                  )
                                )}
                              </div>
                            </div>
                            </div>
                          </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 min-w-[120px]">
                            <button onClick={() => handleViewApplicationDetails(application)} className="px-2 py-1 text-[11px] rounded-md bg-purple-600 text-white hover:bg-purple-700">View</button>
                            <button onClick={() => handleApplicationAction(application.id, 'approve')} className="px-2 py-1 text-[11px] rounded-md bg-green-600 text-white hover:bg-green-700">Approve</button>
                            <button onClick={() => handleApplicationAction(application.id, 'reject')} className="px-2 py-1 text-[11px] rounded-md bg-red-600 text-white hover:bg-red-700">Reject</button>
                          </div>
                        </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
            </div>
              </div>
          </div>
        );

      case 'alerts':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Expiry Alerts</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Left</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {/* Driver Documents */}
                    {drivers.filter(d => d.documents && d.documents.some(doc => {
                      const expiryDate = new Date(doc.expiryDate);
                      const today = new Date();
                      const diffTime = expiryDate - today;
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= 30 && diffDays > 0;
                    })).map((driver) => {
                      const expiringDocs = driver.documents.filter(doc => {
                        const expiryDate = new Date(doc.expiryDate);
                        const today = new Date();
                        const diffTime = expiryDate - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays <= 30 && diffDays > 0;
                      });
                      
                      return expiringDocs.map((doc) => {
                        const expiryDate = new Date(doc.expiryDate);
                        const today = new Date();
                        const diffTime = expiryDate - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        return (
                          <tr key={`driver-${driver.id}-${doc.id}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                                <span className="text-sm font-medium text-gray-900">{doc.documentType}</span>
                            </div>
                          </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {driver.firstName} {driver.lastName} (Driver)
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {expiryDate.toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                diffDays <= 7 ? 'bg-red-100 text-red-800' :
                                diffDays <= 14 ? 'bg-orange-100 text-orange-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {diffDays} days
                                </span>
                          </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900">
                                Send Reminder
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })}
                    
                    {/* Vehicle Documents */}
                    {vehicles.filter(v => {
                      const today = new Date();
                      return (v.registrationExpiry && new Date(v.registrationExpiry) - today <= 30 * 24 * 60 * 60 * 1000 && new Date(v.registrationExpiry) > today) ||
                             (v.insuranceExpiry && new Date(v.insuranceExpiry) - today <= 30 * 24 * 60 * 60 * 1000 && new Date(v.insuranceExpiry) > today) ||
                             (v.roadworthyExpiry && new Date(v.roadworthyExpiry) - today <= 30 * 24 * 60 * 60 * 1000 && new Date(v.roadworthyExpiry) > today);
                    }).map((vehicle) => {
                      const today = new Date();
                      const documents = [];
                      
                      if (vehicle.contractExpiry && new Date(vehicle.contractExpiry) - today <= 30 * 24 * 60 * 60 * 1000 && new Date(vehicle.contractExpiry) > today) {
                        documents.push({
                          type: 'Car Contract',
                          expiry: vehicle.contractExpiry
                        });
                      }
                      if (vehicle.redBookExpiry && new Date(vehicle.redBookExpiry) - today <= 30 * 24 * 60 * 60 * 1000 && new Date(vehicle.redBookExpiry) > today) {
                        documents.push({
                          type: 'Red Book Inspection',
                          expiry: vehicle.redBookExpiry
                        });
                      }
                      if (vehicle.registrationExpiry && new Date(vehicle.registrationExpiry) - today <= 30 * 24 * 60 * 60 * 1000 && new Date(vehicle.registrationExpiry) > today) {
                        documents.push({
                          type: 'Car Registration',
                          expiry: vehicle.registrationExpiry
                        });
                      }
                      if (vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) - today <= 30 * 24 * 60 * 60 * 1000 && new Date(vehicle.insuranceExpiry) > today) {
                        documents.push({
                          type: 'Car Insurance',
                          expiry: vehicle.insuranceExpiry
                        });
                      }
                      if (vehicle.cpvExpiry && new Date(vehicle.cpvExpiry) - today <= 30 * 24 * 60 * 60 * 1000 && new Date(vehicle.cpvExpiry) > today) {
                        documents.push({
                          type: 'CPV Registration',
                          expiry: vehicle.cpvExpiry
                        });
                      }
                      
                      return documents.map((doc) => {
                        const expiryDate = new Date(doc.expiry);
                        const diffTime = expiryDate - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        return (
                          <tr key={`vehicle-${vehicle.id}-${doc.type}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                                <span className="text-sm font-medium text-gray-900">{doc.type}</span>
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {vehicle.make} {vehicle.model} (Vehicle)
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {expiryDate.toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                diffDays <= 7 ? 'bg-red-100 text-red-800' :
                                diffDays <= 14 ? 'bg-orange-100 text-orange-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {diffDays} days
                          </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900">
                                Send Reminder
                              </button>
                          </td>
                        </tr>
                        );
                      });
                    })}
                    </tbody>
                  </table>
            </div>
              </div>
          </div>
        );

      case 'drivers':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="text-2xl font-bold text-gray-900">Total Drivers</h2>
              <button
                onClick={() => setShowAddDriver(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Driver</span>
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver Info</th>
                      <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Details</th>
                      <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle & Contract</th>
                      <th className="hidden xl:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Dates</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drivers.filter(d => d.status === 'approved').map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                    <div>
                              <div className="text-sm font-medium text-gray-900">
                                {driver.firstName} {driver.lastName}
                    </div>
                              <div className="text-xs text-gray-500">
                                ID: {driver.id}
                      </div>
                  </div>
                            <div className="text-xs text-gray-600">
                              <div>📧 {driver.email}</div>
                              <div>📱 {driver.phone}</div>
                      </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2 text-xs text-gray-600">
                      <div>
                              <span className="font-medium">Address:</span><br/>
                              {driver.address}
                      </div>
                      <div>
                              <span className="font-medium">Emergency:</span><br/>
                              {driver.emergencyContact} ({driver.emergencyPhone})
                      </div>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2 text-xs">
                            {driver.vehicleMake && driver.vehicleModel ? (
                      <div>
                                <div className="font-medium text-gray-900">
                                  🚗 {driver.vehicleMake} {driver.vehicleModel}
                      </div>
                                {driver.vehicleLicensePlate && (
                                  <div className="text-gray-600">Plate: {driver.vehicleLicensePlate}</div>
                                )}
                  </div>
                            ) : (
                              <span className="text-gray-400">No vehicle assigned</span>
                            )}
                            <div className="text-gray-600">
                              <div>📅 Contract: {driver.contractPeriod}</div>
                              <div>💳 Bond: ${driver.bondAmount}</div>
                              <div>💰 Weekly: ${driver.weeklyRent}</div>
                            </div>
                        </div>
                        </td>
                        <td className="hidden xl:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="font-medium text-gray-900">Joined:</span><br/>
                              <span className="text-gray-600">
                                {driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : 'N/A'}
                              </span>
                      </div>
                            <div>
                              <span className="font-medium text-gray-900">Next Rent:</span><br/>
                              <span className="text-gray-600">
                                {driver.nextRentDate ? new Date(driver.nextRentDate).toLocaleDateString() : 'Weekly'}
                              </span>
                    </div>
                            <div>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 min-w-[120px]">
                            <button onClick={() => handleViewDriverDetails(driver)} className="px-2 py-1 text-[11px] rounded-md bg-purple-600 text-white hover:bg-purple-700">View</button>
                            <button onClick={() => handleEditDriver(driver)} className="px-2 py-1 text-[11px] rounded-md bg-blue-600 text-white hover:bg-blue-700">Edit</button>
                            <button onClick={() => handleDeleteDriver(driver.id)} className="px-2 py-1 text-[11px] rounded-md bg-red-600 text-white hover:bg-red-700">Delete</button>
                            <button onClick={() => handleSendDocuments(driver)} className="px-2 py-1 text-[11px] rounded-md bg-green-600 text-white hover:bg-green-700">Send Docs</button>
                          </div>
                        </td>
                      </tr>
              ))}
                  </tbody>
                </table>
            </div>
          </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
                  <DollarSign className="w-8 h-8 text-green-600" />
              </div>
                <div className="text-3xl font-bold text-green-600">
                  ${drivers.filter(d => d.status === 'approved').reduce((sum, d) => sum + (d.weeklyRent || 0), 0)}
                </div>
                <p className="text-sm text-gray-500 mt-2">Weekly rental income</p>
            </div>
            
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Payments</h3>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-yellow-600">
                  {drivers.filter(d => d.status === 'pending_approval').length}
              </div>
                <p className="text-sm text-gray-500 mt-2">Applications awaiting approval</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Active Rentals</h3>
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                      </div>
                <div className="text-3xl font-bold text-blue-600">
                  {drivers.filter(d => d.status === 'approved').length}
                </div>
                <p className="text-sm text-gray-500 mt-2">Currently active contracts</p>
                          </div>
                        </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
                                  </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renter</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drivers.filter(d => d.status === 'approved').map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {driver.firstName} {driver.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {driver.vehicleMake} {driver.vehicleModel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${driver.weeklyRent}/week
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                                    </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                                  </div>
                                </div>
                              </div>
                            );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
                        </div>
                      </div>
                    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-xl border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Car className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">SK Car Rental Management</p>
          </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Tip:</span> Use the tabs below to switch between sections quickly
                </p>
              </div>
              
                <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                Sign Out
                </button>
              </div>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Car className="w-8 h-8" />
            </div>
                <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
              <p className="text-blue-100 text-lg">Manage your fleet, review applications, and keep track of all operations from your dashboard.</p>
                      </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          <div 
            className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-4 text-white cursor-pointer hover:from-violet-600 hover:to-violet-700 transition-all duration-200 transform hover:scale-105"
            onClick={() => setActiveTab('applications')}
          >
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm opacity-90">New Applications</p>
                <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                    </div>
              <FileText className="w-8 h-8 opacity-80" />
            </div>
          </div>
          
          <div 
            className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-4 text-white cursor-pointer hover:from-rose-600 hover:to-rose-700 transition-all duration-200 transform hover:scale-105"
            onClick={() => setActiveTab('drivers')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Drivers</p>
                <p className="text-2xl font-bold">{stats.totalDrivers}</p>
              </div>
              <Users className="w-8 h-8 opacity-80" />
                  </div>
              </div>

          <div 
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            onClick={() => setActiveTab('vehicles')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Vehicles</p>
                <p className="text-2xl font-bold">{stats.totalVehicles}</p>
              </div>
              <Car className="w-8 h-8 opacity-80" />
              </div>
              </div>
          
          <div 
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
            onClick={() => setActiveTab('maintenance')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Maintenance</p>
                <p className="text-2xl font-bold">{stats.maintenanceVehicles}</p>
              </div>
              <Wrench className="w-8 h-8 opacity-80" />
              </div>
            </div>

          <div 
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 text-white cursor-pointer hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
            onClick={() => setActiveTab('alerts')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Expiry Alerts</p>
                <p className="text-2xl font-bold">{stats.expiringDocuments}</p>
              </div>
              <AlertTriangle className="w-8 h-8 opacity-80" />
                          </div>
                              </div>
          
          <div 
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
            onClick={() => setActiveTab('payments')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Payments</p>
                <p className="text-2xl font-bold">{stats.totalPayments}</p>
                            </div>
              <DollarSign className="w-8 h-8 opacity-80" />
                            </div>
          </div>
        </div>

        {/* Unified Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20 mb-8">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'applications'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>New Applications</span>
            </button>
            
            <button
              onClick={() => setActiveTab('drivers')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'drivers'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Total Drivers</span>
            </button>
            
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'vehicles'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Car className="w-5 h-5" />
              <span>Vehicles</span>
            </button>
            
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'maintenance'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Wrench className="w-5 h-5" />
              <span>Maintenance</span>
            </button>
            
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'alerts'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              <span>Expiry Alerts</span>
            </button>
            
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'payments'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span>Payments</span>
            </button>
              </div>
            </div>

        {/* Tab Content */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8">
          {renderContent()}
          </div>
      </main>

      {/* Add/Edit Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
                  <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingVehicle(null);
                }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Make *</label>
                      <input
                        type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleInputChange}
                        required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Toyota"
                      />
                    </div>
                
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                      <input
                        type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                        required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Camry"
                      />
                    </div>
                
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                      <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                        required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 2023"
                      />
                    </div>
                
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Plate *</label>
                      <input
                        type="text"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                        required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., ABC123"
                      />
                    </div>
                
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                      <input
                        type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Silver"
                      />
                    </div>
                
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">VIN</label>
                      <input
                        type="text"
                    name="vin"
                    value={formData.vin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 1HGBH41JXMN109186"
                      />
                    </div>
                
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rent Per Week ($)</label>
                      <input
                        type="number"
                    name="rentPerWeek"
                    value={formData.rentPerWeek}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 200"
                      />
                    </div>
                
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Mileage</label>
                      <input
                        type="number"
                    name="currentMileage"
                    value={formData.currentMileage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 50000"
                      />
                    </div>
                
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Odometer</label>
                      <input
                        type="number"
                    name="odoMeter"
                    value={formData.odoMeter}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 50000"
                      />
                    </div>
                
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Next Service Date</label>
                      <input
                        type="date"
                    name="nextServiceDate"
                    value={formData.nextServiceDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                      <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="hatchback">Hatchback</option>
                        <option value="wagon">Wagon</option>
                    <option value="coupe">Coupe</option>
                        <option value="convertible">Convertible</option>
                    <option value="pickup">Pickup</option>
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                      </select>
                    </div>
                
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                      <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="lpg">LPG</option>
                      </select>
                    </div>
                
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                      <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                    <option value="cvt">CVT</option>
                    <option value="semi-auto">Semi-Automatic</option>
                      </select>
                    </div>
                
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="reserved">Reserved</option>
                    <option value="out_of_service">Out of Service</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name</label>
                      <input
                        type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., John Doe"
                      />
                  </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Photo</label>
                    <input
                      type="file"
                    name="vehiclePhoto"
                    onChange={handleInputChange}
                      accept="image/*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Car Contract</label>
                  <input type="file" name="contractDoc" onChange={handleInputChange} accept=".pdf,.jpg,.jpeg,.png" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contract Expiry Date</label>
                  <input type="date" name="contractExpiry" value={formData.contractExpiry} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Red Book Inspection</label>
                  <input type="file" name="redBookDoc" onChange={handleInputChange} accept=".pdf,.jpg,.jpeg,.png" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Red Book Expiry Date</label>
                  <input type="date" name="redBookExpiry" value={formData.redBookExpiry} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Car Registration</label>
                  <input type="file" name="registrationDoc" onChange={handleInputChange} accept=".pdf,.jpg,.jpeg,.png" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Expiry Date</label>
                  <input type="date" name="registrationExpiry" value={formData.registrationExpiry} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Car Insurance</label>
                  <input type="file" name="insuranceDoc" onChange={handleInputChange} accept=".pdf,.jpg,.jpeg,.png" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Expiry Date</label>
                  <input type="date" name="insuranceExpiry" value={formData.insuranceExpiry} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CPV Registration</label>
                  <input type="file" name="cpvDoc" onChange={handleInputChange} accept=".pdf,.jpg,.jpeg,.png" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CPV Expiry Date</label>
                  <input type="date" name="cpvExpiry" value={formData.cpvExpiry} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingVehicle(null);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                  {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                    </button>
                  </div>
                </form>
            </div>
          </div>
        )}

      {/* Driver Details Modal */}
      {/* Add Driver Modal */}
      {showAddDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Driver</h2>
              <button onClick={() => setShowAddDriver(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
                  </button>
                </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData();
                Object.entries(driverForm).forEach(([k,v]) => { if (v) fd.append(k, v); });
                const response = await fetch('/api/drivers', { method: 'POST', body: fd });
                if (response.ok) {
                  setShowAddDriver(false);
                  setDriverForm({
                    firstName: '', lastName: '', email: '', phone: '', licenseNumber: '', licenseExpiry: '',
                    address: '', emergencyContact: '', emergencyPhone: '', selectedVehicleId: '',
                    contractStartDate: '', contractEndDate: '', contractPeriod: '', bondAmount: '1000', weeklyRent: '200',
                    licenseFront: null, licenseBack: null, bondProof: null, rentProof: null, contractDoc: null
                  });
                  fetchData();
                } else {
                  const err = await response.json();
                  alert(err.error || 'Failed to add driver');
                }
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Front</label>
                    <input type="file" accept="image/*,application/pdf" onChange={(e)=>setDriverForm({...driverForm, licenseFront: e.target.files?.[0] || null})} className="w-full px-4 py-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Back</label>
                    <input type="file" accept="image/*,application/pdf" onChange={(e)=>setDriverForm({...driverForm, licenseBack: e.target.files?.[0] || null})} className="w-full px-4 py-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bond Proof</label>
                    <input type="file" accept="image/*,application/pdf" onChange={(e)=>setDriverForm({...driverForm, bondProof: e.target.files?.[0] || null})} className="w-full px-4 py-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rent Proof</label>
                    <input type="file" accept="image/*,application/pdf" onChange={(e)=>setDriverForm({...driverForm, rentProof: e.target.files?.[0] || null})} className="w-full px-4 py-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contract Document</label>
                    <input type="file" accept="image/*,application/pdf" onChange={(e)=>setDriverForm({...driverForm, contractDoc: e.target.files?.[0] || null})} className="w-full px-4 py-3 border rounded-xl" />
                  </div>
                </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input className="w-full px-4 py-3 border rounded-xl" value={driverForm.firstName} onChange={(e)=>setDriverForm({...driverForm, firstName:e.target.value})} required />
                    </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input className="w-full px-4 py-3 border rounded-xl" value={driverForm.lastName} onChange={(e)=>setDriverForm({...driverForm, lastName:e.target.value})} required />
                    </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input type="email" className="w-full px-4 py-3 border rounded-xl" value={driverForm.email} onChange={(e)=>setDriverForm({...driverForm, email:e.target.value})} required />
                    </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input className="w-full px-4 py-3 border rounded-xl" value={driverForm.phone} onChange={(e)=>setDriverForm({...driverForm, phone:e.target.value})} required />
                    </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
                  <input className="w-full px-4 py-3 border rounded-xl" value={driverForm.licenseNumber} onChange={(e)=>setDriverForm({...driverForm, licenseNumber:e.target.value})} required />
                    </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Expiry</label>
                  <input type="date" className="w-full px-4 py-3 border rounded-xl" value={driverForm.licenseExpiry} onChange={(e)=>setDriverForm({...driverForm, licenseExpiry:e.target.value})} />
                    </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input className="w-full px-4 py-3 border rounded-xl" value={driverForm.address} onChange={(e)=>setDriverForm({...driverForm, address:e.target.value})} />
                    </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <input className="w-full px-4 py-3 border rounded-xl" value={driverForm.emergencyContact} onChange={(e)=>setDriverForm({...driverForm, emergencyContact:e.target.value})} />
                    </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Phone</label>
                  <input className="w-full px-4 py-3 border rounded-xl" value={driverForm.emergencyPhone} onChange={(e)=>setDriverForm({...driverForm, emergencyPhone:e.target.value})} />
                    </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign Vehicle</label>
                  <select className="w-full px-4 py-3 border rounded-xl" value={driverForm.selectedVehicleId} onChange={(e)=>setDriverForm({...driverForm, selectedVehicleId:e.target.value})}>
                    <option value="">None</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.make} {v.model} • {v.licensePlate}</option>
                    ))}
                      </select>
                    </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contract Start</label>
                  <input type="date" className="w-full px-4 py-3 border rounded-xl" value={driverForm.contractStartDate} onChange={(e)=>setDriverForm({...driverForm, contractStartDate:e.target.value})} />
                    </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contract End</label>
                  <input type="date" className="w-full px-4 py-3 border rounded-xl" value={driverForm.contractEndDate} onChange={(e)=>setDriverForm({...driverForm, contractEndDate:e.target.value})} />
                    </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contract Period</label>
                  <input className="w-full px-4 py-3 border rounded-xl" value={driverForm.contractPeriod} onChange={(e)=>setDriverForm({...driverForm, contractPeriod:e.target.value})} />
                    </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bond Amount ($)</label>
                  <input type="number" className="w-full px-4 py-3 border rounded-xl" value={driverForm.bondAmount} onChange={(e)=>setDriverForm({...driverForm, bondAmount:e.target.value})} />
                    </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Rent ($)</label>
                  <input type="number" className="w-full px-4 py-3 border rounded-xl" value={driverForm.weeklyRent} onChange={(e)=>setDriverForm({...driverForm, weeklyRent:e.target.value})} />
                  </div>
                        </div>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={()=>setShowAddDriver(false)} className="px-6 py-3 border rounded-xl">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded-xl">Save Driver</button>
                            </div>
                </form>
                        </div>
                      </div>
                    )}
      {showDriverDetails && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedDriver.status === 'pending_approval' ? 'Application Details' : 'Driver Details'}
                </h2>
                   <button
                  onClick={() => setShowDriverDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                   >
                  <X className="w-6 h-6" />
                   </button>
                 </div>
                     </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                     <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.firstName} {selectedDriver.lastName}</span>
                     </div>
                     <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.email}</span>
                     </div>
                     <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.phone}</span>
                     </div>
                     <div>
                    <span className="font-medium text-gray-700">Address:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.address}</span>
                     </div>
                     <div>
                    <span className="font-medium text-gray-700">Emergency Contact:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.emergencyContact}</span>
                     </div>
                     <div>
                    <span className="font-medium text-gray-700">Emergency Phone:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.emergencyPhone}</span>
                     </div>
                     </div>
              </div>

              {/* Vehicle & Contract Information */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🚗 Vehicle & Contract</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                     <div>
                    <span className="font-medium text-gray-700">Vehicle Type:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.vehicleType || 'Not specified'}</span>
                     </div>
                     <div>
                    <span className="font-medium text-gray-700">Vehicle Registration:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.vehicleRego || 'Not specified'}</span>
                     </div>
                     <div>
                    <span className="font-medium text-gray-700">Contract Period:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.contractPeriod || 'Not specified'}</span>
                     </div>
                       <div>
                    <span className="font-medium text-gray-700">Agreed KMs per Week:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.agreedKmsPerWeek || 'Not specified'}</span>
                       </div>
                       <div>
                    <span className="font-medium text-gray-700">Daily Rate:</span>
                    <span className="ml-2 text-gray-900">${selectedDriver.dailyRate || 'Not specified'}</span>
                       </div>
                       <div>
                    <span className="font-medium text-gray-700">Weekly Rent:</span>
                    <span className="ml-2 text-gray-900">${selectedDriver.weeklyRent || 'Not specified'}</span>
                       </div>
                     </div>
                  </div>

              {/* Financial Terms */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Financial Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Security Bond:</span>
                    <span className="ml-2 text-gray-900">${selectedDriver.securityBond || 'Not specified'}</span>
                             </div>
                  <div>
                    <span className="font-medium text-gray-700">Bond Amount:</span>
                    <span className="ml-2 text-gray-900">${selectedDriver.bondAmount || 'Not specified'}</span>
                           </div>
                  <div>
                    <span className="font-medium text-gray-700">Insurance Excess (25+ years):</span>
                    <span className="ml-2 text-gray-900">${selectedDriver.insuranceExcess25 || '1300'}</span>
                       </div>
                  <div>
                    <span className="font-medium text-gray-700">Insurance Excess (21-24 years):</span>
                    <span className="ml-2 text-gray-900">${selectedDriver.insuranceExcess21 || '1800'}</span>
                     </div>
                       <div>
                    <span className="font-medium text-gray-700">Late Fee Percentage:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.lateFeePercentage || '5'}%</span>
                       </div>
                       <div>
                    <span className="font-medium text-gray-700">Notice Period:</span>
                    <span className="ml-2 text-gray-900">{selectedDriver.noticePeriodWeeks || '2'} weeks</span>
                       </div>
                     </div>
                   </div>

              {/* Documents Section */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Documents</h3>
                <div className="space-y-3">
                  {(selectedDriver.licenseFrontUrl || selectedDriver.licenseFront) && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium">License Front</span>
                   </div>
                      <div className="space-x-2">
                        <button onClick={() => openPreview((selectedDriver.licenseFrontUrl || `/uploads/${selectedDriver.licenseFront}`), 'License Front')} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg hover:bg-blue-100 transition-colors">Preview</button>
                        <button onClick={() => downloadFile((selectedDriver.licenseFrontUrl || `/uploads/${selectedDriver.licenseFront}`), selectedDriver.licenseFront || 'license-front')} className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">📥 Download</button>
                 </div>
               </div>
                  )}
                  {(selectedDriver.licenseBackUrl || selectedDriver.licenseBack) && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium">License Back</span>
                      </div>
                      <div className="space-x-2">
                        <button onClick={() => openPreview((selectedDriver.licenseBackUrl || `/uploads/${selectedDriver.licenseBack}`), 'License Back')} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg hover:bg-blue-100 transition-colors">Preview</button>
                        <button onClick={() => downloadFile((selectedDriver.licenseBackUrl || `/uploads/${selectedDriver.licenseBack}`), selectedDriver.licenseBack || 'license-back')} className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">📥 Download</button>
             </div>
           </div>
         )}
                  {(selectedDriver.bondProofUrl || selectedDriver.bondProof) && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium">Bond Proof</span>
                </div>
                      <div className="space-x-2">
                        <button onClick={() => openPreview((selectedDriver.bondProofUrl || `/uploads/${selectedDriver.bondProof}`), 'Bond Proof')} className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-lg hover:bg-green-100 transition-colors">Preview</button>
                        <button onClick={() => downloadFile((selectedDriver.bondProofUrl || `/uploads/${selectedDriver.bondProof}`), selectedDriver.bondProof || 'bond-proof')} className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors">📥 Download</button>
                    </div>
                        </div>
                  )}
                  {(selectedDriver.rentProofUrl || selectedDriver.rentProof) && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium">Rent Proof</span>
                    </div>
                      <div className="space-x-2">
                        <button onClick={() => openPreview((selectedDriver.rentProofUrl || `/uploads/${selectedDriver.rentProof}`), 'Rent Proof')} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-lg hover:bg-purple-100 transition-colors">Preview</button>
                        <button onClick={() => downloadFile((selectedDriver.rentProofUrl || `/uploads/${selectedDriver.rentProof}`), selectedDriver.rentProof || 'rent-proof')} className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors">📥 Download</button>
                    </div>
                    </div>
                  )}
                  {!selectedDriver.licenseFrontUrl && !selectedDriver.licenseFront && !selectedDriver.licenseBackUrl && !selectedDriver.licenseBack && !selectedDriver.bondProofUrl && !selectedDriver.bondProof && !selectedDriver.rentProofUrl && !selectedDriver.rentProof && (
                    <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
                  )}
                </div>
              </div>

              {/* Status & Dates */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Status & Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedDriver.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedDriver.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedDriver.status === 'pending_approval' ? 'Pending Approval' :
                       selectedDriver.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                    </div>
                    <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedDriver.createdAt ? new Date(selectedDriver.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                    </div>
                  {selectedDriver.nextRentDate && (
                    <div>
                      <span className="font-medium text-gray-700">Next Rent Date:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(selectedDriver.nextRentDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  </div>
              </div>
                  </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                    <button
                  onClick={() => setShowDriverDetails(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                  Close
                    </button>
                {selectedDriver.status === 'pending_approval' && (
                    <button
                    onClick={() => {
                      setShowDriverDetails(false);
                      handleApplicationAction(selectedDriver.id, 'approve');
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                  >
                    ✅ Approve Application
                    </button>
                )}
                  </div>
              </div>
            </div>
          </div>
        )}
      {showDocPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDocPreview(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{previewDocTitle}</h3>
              <div className="space-x-2">
                <button onClick={() => downloadFile(previewDocUrl, previewDocTitle)} className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg">📥 Download</button>
                <button onClick={() => setShowDocPreview(false)} className="px-3 py-1 border rounded-lg">Close</button>
      </div>
            </div>
            <div className="p-4 bg-gray-50">
              {previewDocUrl.startsWith('data:application/pdf') ? (
                <iframe src={previewDocUrl} title="document" className="w-full h-[70vh]" />
              ) : (
                <img src={previewDocUrl} alt="document" className="max-h-[75vh] w-auto mx-auto object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
