import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';
import { Car, Calendar, Phone, Mail, User, MapPin, ShieldCheck, DollarSign, Upload, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const RentalApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const vehicle = location.state?.vehicle || null;

  const [form, setForm] = useState({
    contractPeriod: '',
    firstName: '',
    lastName: '',
    email: currentUser?.email || '',
    phone: '',
    licenseExpiry: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    paymentAmount: ''
  });
  const [carPhotos, setCarPhotos] = useState([]);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [licenseCard, setLicenseCard] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);

  useEffect(() => {
    if (!vehicle) {
      navigate('/user-dashboard');
    }
  }, [vehicle, navigate]);

  const totalRequired = useMemo(() => {
    const bond = Number(vehicle?.bondAmount || 0);
    const week = Number(vehicle?.rentPerWeek || 0);
    return bond + week;
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    const required = ['contractPeriod','firstName','lastName','email','phone','licenseExpiry','address','emergencyContact','emergencyPhone','paymentAmount'];
    const missing = required.filter((k) => !form[k] || String(form[k]).trim() === '');
    if (missing.length) {
      setError('Please fill all required fields.');
      return;
    }

    const amount = Number(form.paymentAmount);
    if (Number.isNaN(amount) || amount < totalRequired) {
      setError(`Amount must be at least $${totalRequired}.`);
      return;
    }

    if (carPhotos.length === 0) {
      setError('Please upload at least one current car photo.');
      return;
    }

    if (!licenseCard) {
      setError('Please upload your driver license card.');
      return;
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('vehicleId', vehicle.id);
      fd.append('contractPeriod', form.contractPeriod);
      fd.append('firstName', form.firstName);
      fd.append('lastName', form.lastName);
      fd.append('email', form.email);
      fd.append('phone', form.phone);
      fd.append('licenseExpiry', form.licenseExpiry);
      fd.append('address', form.address);
      fd.append('emergencyContact', form.emergencyContact);
      fd.append('emergencyPhone', form.emergencyPhone);
      fd.append('contractSigned', 'true');
      fd.append('bondAmount', vehicle.bondAmount || 0);
      fd.append('weeklyRent', vehicle.rentPerWeek || 0);
      fd.append('paymentAmount', amount);

      carPhotos.forEach((file) => fd.append('carPhotos', file));
      if (licenseCard) fd.append('licenseCard', licenseCard);
      if (paymentReceipt) fd.append('paymentReceipt', paymentReceipt);

      const res = await fetch(`${API_BASE_URL}/api/rentals`, {
        method: 'POST',
        body: fd
      });

      if (!res.ok) {
        // Attempt to read JSON error, else text
        let errMsg = 'Failed to submit application';
        try {
          const data = await res.json();
          errMsg = data.error || data.detail || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      setSuccess('Application submitted! Await admin approval.');
      setShowSubmittedModal(true);
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!vehicle) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-700 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <div className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-blue-600" />
            <span className="font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">SK Car Rental</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vehicle Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {vehicle.photoUrls?.length ? (
                  <img src={vehicle.photoUrls[0]} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
                ) : (
                  <Car className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{vehicle.make} {vehicle.model}</h2>
                <p className="text-gray-600">{vehicle.year} • {vehicle.color} • {vehicle.transmission}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">${vehicle.rentPerWeek}</p>
              <p className="text-sm text-gray-500">per week</p>
              <p className="text-sm text-gray-600 mt-1">Bond: <span className="font-semibold">${vehicle.bondAmount}</span></p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center p-4 text-sm text-red-800 border border-red-200 rounded-lg bg-red-50">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center p-4 text-sm text-green-800 border border-green-200 rounded-lg bg-green-50">
              <CheckCircle className="w-4 h-4 mr-2" />
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contract Period *</label>
              <select
                name="contractPeriod"
                value={form.contractPeriod}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  name="firstName"
                  type="text"
                  required
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  name="lastName"
                  type="text"
                  required
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload License Card *</label>
              <input
                type="file"
                accept="image/*,.pdf"
                required
                onChange={(e) => setLicenseCard((e.target.files || [])[0] || null)}
                className="w-full"
              />
              {licenseCard && (
                <p className="text-xs text-green-700 mt-1">{licenseCard.name} selected</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry *</label>
              <input
                name="licenseExpiry"
                type="date"
                required
                value={form.licenseExpiry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <textarea
                  name="address"
                  rows={3}
                  required
                  value={form.address}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact *</label>
              <input
                name="emergencyContact"
                type="text"
                required
                value={form.emergencyContact}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone *</label>
              <input
                name="emergencyPhone"
                type="tel"
                required
                value={form.emergencyPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-green-600" /> Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-2">Required now:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Bond</p>
                    <p className="text-xl font-bold text-blue-700">${vehicle.bondAmount}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600">1 Week Rent</p>
                    <p className="text-xl font-bold text-green-700">${vehicle.rentPerWeek}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid ($) *</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    name="paymentAmount"
                    type="number"
                    min={totalRequired}
                    placeholder={String(totalRequired)}
                    required
                    value={form.paymentAmount}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Upload className="w-5 h-5 mr-2" /> Upload Current Car Photos *</h3>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setCarPhotos(Array.from(e.target.files || []))}
                className="w-full"
              />
              {carPhotos.length > 0 && (
                <p className="text-sm text-green-700 mt-2">{carPhotos.length} photo(s) selected</p>
              )}
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Upload className="w-5 h-5 mr-2" /> Upload Payment Receipt (optional)</h3>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setPaymentReceipt((e.target.files || [])[0] || null)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-3 rounded-lg text-white font-medium transition-all ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl'}`}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>

      {showSubmittedModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-2">Application submitted</h3>
            <p className="text-sm text-gray-700">We received your application for {vehicle.make} {vehicle.model}. You can track its status in your dashboard under Applications.</p>
            <div className="mt-6 text-right">
              <button onClick={() => navigate('/user-dashboard')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Go to Dashboard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalApplication;
