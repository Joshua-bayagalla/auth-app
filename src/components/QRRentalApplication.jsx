import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  FileText, 
  Upload, 
  CreditCard, 
  CheckCircle, 
  ArrowLeft,
  Camera,
  Shield,
  Mail,
  Phone,
  MapPin,
  Car
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const QRRentalApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const vehicle = location.state?.vehicle; // Potentially pre-selected vehicle

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Details
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // Vehicle Details
    make: '',
    model: '',
    color: '',
    year: '',
    licensePlate: '',
    
    // Contract Details
    weeklyRent: '',
    vehicleType: '',
    vehicleRego: '',
    contractPeriod: '',
    securityBond: '',
    bondAmount: '1000',
    insuranceExcess25: '1300',
    insuranceExcess21: '1800',
    agreedKmsPerWeek: '1000',
    dailyRate: '28',
    lateFeePercentage: '5',
    noticePeriodWeeks: '2',
    
    // Documents
    licenseFront: null,
    licenseBack: null,
    bondProof: null,
    rentProof: null,
    
    // Contract Agreement
    contractAgreement: false
  });

  const [loading, setLoading] = useState(false);
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add all form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key.includes('license') || key.includes('Proof') || key.includes('contractDocument')) {
            formDataToSend.append(key, formData[key]);
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      // Add vehicle details if available
      if (vehicle) {
        formDataToSend.append('vehicleId', vehicle.id);
        formDataToSend.append('vehicleMake', vehicle.make);
        formDataToSend.append('vehicleModel', vehicle.model);
        formDataToSend.append('vehicleLicensePlate', vehicle.licensePlate);
      }

      const response = await fetch(`${API_BASE_URL}/api/rental-applications`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setShowSubmittedModal(true);
      } else {
        const error = await response.json();
        alert(`Error submitting application: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Details', icon: User },
    { number: 2, title: 'Contract', icon: Shield },
    { number: 3, title: 'Payment', icon: CreditCard },
    { number: 4, title: 'Documents', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-xl border-b border-white/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Rental Application
                </h1>
                <p className="text-xs text-gray-600">Step {currentStep} of 4</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Personal Details */}
          {currentStep === 1 && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8">
              <div className="flex items-center mb-6">
                <User className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Personal Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your last name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your full address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact *</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Emergency contact name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Phone *</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Emergency contact phone"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contract */}
          {currentStep === 2 && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8">
              <div className="flex items-center mb-6">
                <Shield className="w-8 h-8 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">SK Car Rental Agreement</h2>
              </div>
              
              <div className="space-y-6">
                {/* Contract Form */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">📋 Contract Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Vehicle Information */}
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-900 border-b pb-2">🚗 Vehicle Details</h5>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Make *</label>
                        <input
                          type="text"
                          name="make"
                          value={formData.make || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., Toyota"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                        <input
                          type="text"
                          name="model"
                          value={formData.model || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., Camry"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                        <input
                          type="text"
                          name="color"
                          value={formData.color || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., Silver"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                        <input
                          type="number"
                          name="year"
                          value={formData.year || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., 2020"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">License Plate *</label>
                        <input
                          type="text"
                          name="licensePlate"
                          value={formData.licensePlate || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., ABC123"
                        />
                      </div>
                    </div>
                    
                    {/* Additional Vehicle Details */}
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-900 border-b pb-2">📋 Additional Details</h5>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                        <select
                          name="vehicleType"
                          value={formData.vehicleType || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select vehicle type</option>
                          <option value="Sedan">Sedan</option>
                          <option value="Hatchback">Hatchback</option>
                          <option value="SUV">SUV</option>
                          <option value="Van">Van</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Registration</label>
                        <input
                          type="text"
                          name="vehicleRego"
                          value={formData.vehicleRego || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., ABC123"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Rent (AUD)</label>
                        <input
                          type="number"
                          name="weeklyRent"
                          value={formData.weeklyRent || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., 195"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Security Bond (AUD)</label>
                        <input
                          type="number"
                          name="securityBond"
                          value={formData.securityBond || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., 2000"
                        />
                      </div>
                    </div>
                    
                    {/* Contract Terms */}
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-900 border-b pb-2">📜 Contract Terms</h5>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contract Period</label>
                        <input
                          type="text"
                          name="contractPeriod"
                          value={formData.contractPeriod || ''}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., 12 months"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Late Fee Percentage</label>
                        <input
                          type="number"
                          name="lateFeePercentage"
                          value={formData.lateFeePercentage || '5'}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="5"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notice Period (Weeks)</label>
                        <input
                          type="number"
                          name="noticePeriodWeeks"
                          value={formData.noticePeriodWeeks || '2'}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="2"
                        />
                      </div>
                    </div>
                  </div>
                  

                  
                  {/* Contract Terms */}
                  <div className="mt-8 space-y-4">
                    <h5 className="font-medium text-gray-900 border-b pb-2">📜 Contract Terms & Conditions</h5>
                    
                    <div className="bg-white rounded-xl p-4 space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <span className="font-medium text-indigo-600">1.</span>
                        <span>The Lessor will rent out a <strong>{formData.make || '_____'}</strong> <strong>{formData.model || '_____'}</strong> <strong>{formData.color || '_____'}</strong> <strong>{formData.year || '_____'}</strong> (License: <strong>{formData.licensePlate || '_____'}</strong>) to the Lessee. Weekly rent: <strong>AU${formData.weeklyRent || '_____'}/Week</strong></span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="font-medium text-indigo-600">2.</span>
                        <span>Security bond of <strong>AU${formData.securityBond || '_____'}</strong> must be deposited in advance and is refundable upon vehicle return in undisputed condition.</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="font-medium text-indigo-600">3.</span>
                        <span>Insurance excess: <strong>AU${formData.insuranceExcess25 || '1300'}</strong> for drivers 25+ years, <strong>AU${formData.insuranceExcess21 || '1800'}</strong> for drivers 21-24 years.</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="font-medium text-indigo-600">4.</span>
                        <span>Glass and glass screen damage are not covered under insurance. Driver is responsible for all glass repairs.</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="font-medium text-indigo-600">5.</span>
                        <span>Vehicle can only be used for rideshare purposes under the lessee's name in Victoria state only.</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="font-medium text-indigo-600">6.</span>
                        <span>Lessee must give minimum <strong>{formData.noticePeriodWeeks || '2'}</strong> weeks notice before terminating the lease.</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="font-medium text-indigo-600">7.</span>
                        <span>Weekly rent must be paid in advance. <strong>{formData.lateFeePercentage || '5'}%</strong> late fee applies for late payments.</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="font-medium text-indigo-600">8.</span>
                        <span>Vehicle must be maintained in roadworthy condition. Lessee responsible for tyre punctures and regular servicing.</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="font-medium text-indigo-600">9.</span>
                        <span>Contract period: <strong>{formData.contractPeriod || '_____'}</strong> with option to extend by mutual agreement.</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="font-medium text-indigo-600">10.</span>
                        <span>Agreed kilometers per week: <strong>{formData.agreedKmsPerWeek || '1000'}</strong> km. Lessee must notify for service when within 500km of marked odometer reading.</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="font-medium text-indigo-600">11.</span>
                        <span>Daily rate: <strong>AU${formData.dailyRate || '28'}</strong>/day. Bond amount: <strong>AU${formData.bondAmount || '1000'}</strong>.</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="font-medium text-indigo-600">12.</span>
                        <span>Lessee is responsible for all liabilities during vehicle use, including accidents, damage, and third-party involvement.</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="font-medium text-indigo-600">13.</span>
                        <span>Vehicle keys must be returned. If lost, lessee must provide genuine programmed key from vehicle dealership.</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <span className="font-medium text-indigo-600">14.</span>
                        <span>This agreement serves as a legal document for conflict resolution between parties.</span>
                      </div>
                    </div>
                  </div>
                </div>
                

                
                {/* Agreement Checkbox */}
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="contractAgreement"
                      checked={formData.contractAgreement || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, contractAgreement: e.target.checked }))}
                      required
                      className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">
                      I have read, understood, and agree to all the terms and conditions of this SK Car Rental Agreement. I acknowledge my responsibilities for vehicle maintenance, insurance excess payments, and compliance with all rental terms.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment Information */}
          {currentStep === 3 && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8">
              <div className="flex items-center mb-6">
                <CreditCard className="w-8 h-8 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Payment Information</h2>
              </div>
              
              {/* Bond Payment Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 border-2 border-green-200 mb-6">
                <h3 className="text-xl font-bold text-green-900 mb-6 text-center">💳 Bond Payment</h3>
                
                {/* Bond Payment Details */}
                <div className="bg-white rounded-xl p-6 border-2 border-green-400 shadow-lg mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Upload className="w-6 h-6 text-green-600 mr-2" />
                      <h4 className="text-lg font-semibold text-green-900">PAYID Payment</h4>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">PAYID</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Mobile:</span>
                      <span className="text-green-900 font-semibold">+61411766786</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Use this for instant payments</p>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-800 text-sm font-medium">💡 <strong>Use PAYID to pay your bond amount (one-time payment)</strong></p>
                    <p className="text-green-700 text-xs mt-1">Transfer the bond amount specified in your contract as a one-time payment</p>
                  </div>
                </div>
                
                {/* Bond Payment Upload */}
                <div className="bg-white rounded-xl p-6 border-2 border-green-400 shadow-lg">
                  <h4 className="text-lg font-semibold text-green-900 mb-4">📤 Bond Payment Proof</h4>
                  <div className="border-2 border-dashed border-green-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                    <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <input
                      type="file"
                      name="bondProof"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'bondProof')}
                      className="hidden"
                      id="bondProof"
                      required
                    />
                    <label htmlFor="bondProof" className="cursor-pointer">
                      <p className="text-sm text-gray-600">Click to upload bond payment receipt</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF up to 10MB</p>
                    </label>
                  </div>
                  {formData.bondProof && (
                    <p className="text-sm text-green-600 mt-2">✓ {formData.bondProof.name}</p>
                  )}
                </div>
              </div>
              
              {/* Weekly Rent Payment Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border-2 border-blue-200 mb-8">
                <h3 className="text-xl font-bold text-blue-900 mb-6 text-center">💰 Weekly Rent Payment</h3>
                
                {/* Weekly Rent Payment Details */}
                <div className="bg-white rounded-xl p-6 border-2 border-blue-400 shadow-lg mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                      <h4 className="text-lg font-semibold text-blue-900">Business Account</h4>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Business Account</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Account Name:</span>
                      <span className="text-blue-900 font-semibold">Kamboh logistics pty ltd</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">BSB:</span>
                      <span className="text-blue-900 font-semibold">083004</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Account Number:</span>
                      <span className="text-blue-900 font-semibold">787900650</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-800 text-sm font-medium">💡 <strong>Use this Business Account to pay your weekly rent amount</strong></p>
                    <p className="text-blue-700 text-xs mt-1">Transfer the weekly rent amount specified in your contract</p>
                  </div>
                </div>
                
                {/* Weekly Rent Payment Upload */}
                <div className="bg-white rounded-xl p-6 border-2 border-blue-400 shadow-lg">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">📤 Weekly Rent Payment Proof</h4>
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                    <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <input
                      type="file"
                      name="rentProof"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, 'rentProof')}
                      className="hidden"
                      id="rentProof"
                      required
                    />
                    <label htmlFor="rentProof" className="cursor-pointer">
                      <p className="text-sm text-gray-600">Click to upload weekly rent payment receipt</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF up to 10MB</p>
                    </label>
                  </div>
                  {formData.rentProof && (
                    <p className="text-sm text-blue-600 mt-2">✓ {formData.rentProof.name}</p>
                  )}
                </div>
              </div>
              

            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8">
              <div className="flex items-center mb-6">
                <FileText className="w-8 h-8 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Document Upload</h2>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Driving License (Front) *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        name="licenseFront"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'licenseFront')}
                        className="hidden"
                        id="licenseFront"
                        required
                      />
                      <label htmlFor="licenseFront" className="cursor-pointer">
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF up to 10MB</p>
                      </label>
                    </div>
                    {formData.licenseFront && (
                      <p className="text-sm text-green-600 mt-2">✓ {formData.licenseFront.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Driving License (Back) *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        name="licenseBack"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'licenseBack')}
                        className="hidden"
                        id="licenseBack"
                        required
                      />
                      <label htmlFor="licenseBack" className="cursor-pointer">
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF up to 10MB</p>
                      </label>
                    </div>
                    {formData.licenseBack && (
                      <p className="text-sm text-green-600 mt-2">✓ {formData.licenseBack.name}</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </main>

      {/* Success Modal */}
      {showSubmittedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
            <p className="text-gray-600 mb-6">
              Your rental application has been submitted successfully. You will receive an email confirmation with payment receipt, vehicle inspection report, registration certificate, and CPV registration report once approved.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              Return to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRRentalApplication;
