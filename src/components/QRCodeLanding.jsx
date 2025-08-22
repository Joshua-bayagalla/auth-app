import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, QrCode, ArrowRight, Download, Upload, FileText, CreditCard, User, Shield, Clock, TrendingUp } from 'lucide-react';
import QRCode from 'qrcode';

const QRCodeLanding = () => {
  const navigate = useNavigate();
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const handleScanQR = () => {
    // Navigate to the new rental application form
    navigate('/qr-rental-application');
  };

  const generateQRCode = async () => {
    try {
      // Generate QR code with the application URL
      const applicationUrl = `${window.location.origin}/qr-rental-application`;
      const qrDataUrl = await QRCode.toDataURL(applicationUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
      setShowQRCode(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Fallback to showing QR code anyway
      setShowQRCode(true);
    }
  };

  // Generate QR code on component mount
  useEffect(() => {
    generateQRCode();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-xl border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Car className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  SK Car Rental
                </h1>
                <p className="text-xs text-gray-600 font-medium">QR Code Rental System</p>
              </div>
            </div>
            
            {/* Admin Login Link */}
            <button
              onClick={() => navigate('/admin-login')}
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
            >
              Admin Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <QrCode className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Scan & Rent
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Scan the QR code to start your car rental application. No sign-up required - just scan and fill in your details.
            </p>
          </div>

          {/* QR Code Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 max-w-md mx-auto mb-12">
            <div className="text-center">
              <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-gray-200 shadow-lg p-4">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code for SK Car Rental Application" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-black rounded-lg flex items-center justify-center mx-auto mb-2">
                      <div className="w-24 h-24 bg-white rounded flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-black" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">SK Car Rental</p>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-4">Scan this QR code with your phone camera</p>
              <button
                onClick={handleScanQR}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
              >
                <span>Start Application</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">1. Personal Details</h3>
              <p className="text-gray-600 text-center">Fill in your personal information and contact details</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">2. Upload Documents</h3>
              <p className="text-gray-600 text-center">Upload your license, bond proof, and rent payment</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">3. Get Approved</h3>
              <p className="text-gray-600 text-center">Receive email confirmation with all documents</p>
            </div>
          </div>

          {/* Additional Features Section */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 max-w-4xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Why Choose SK Car Rental?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Wide Vehicle Selection</h3>
                  <p className="text-gray-600">Choose from our diverse fleet of well-maintained vehicles</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Safe</h3>
                  <p className="text-gray-600">All vehicles are fully insured and regularly maintained</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
                  <p className="text-gray-600">Round-the-clock customer support for any assistance</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Plans</h3>
                  <p className="text-gray-600">Daily, weekly, and monthly rental options available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details Section */}
      </main>
    </div>
  );
};

export default QRCodeLanding;
