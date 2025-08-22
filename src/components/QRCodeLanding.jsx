import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, QrCode, ArrowRight, Download, Upload, FileText, CreditCard, User, Shield } from 'lucide-react';

const QRCodeLanding = () => {
  const navigate = useNavigate();
  const [showQRCode, setShowQRCode] = useState(false);

  const handleScanQR = () => {
    // Navigate to the new rental application form
    navigate('/qr-rental-application');
  };

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
            {!showQRCode ? (
              <div className="text-center">
                <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-gray-300">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">QR Code will appear here</p>
                <button
                  onClick={() => setShowQRCode(true)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Generate QR Code
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-gray-200 shadow-lg">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-black rounded-lg flex items-center justify-center mx-auto mb-2">
                      <div className="w-24 h-24 bg-white rounded flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-black" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">SK Car Rental</p>
                  </div>
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
            )}
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Personal Details</h3>
              <p className="text-gray-600 text-sm">Fill in your personal information and contact details</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Upload Documents</h3>
              <p className="text-gray-600 text-sm">Upload your license, bond proof, and rent payment</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Get Approved</h3>
              <p className="text-gray-600 text-sm">Receive email confirmation with all documents</p>
            </div>
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Payment Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900">Business Account</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> Kamboh logistics pty ltd</p>
                <p><span className="font-medium">BSB:</span> 083004</p>
                <p><span className="font-medium">Account:</span> 787900650</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <Upload className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-green-900">PAYID</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Mobile:</span> +61411766786</p>
                <p className="text-xs text-gray-600">Use this for quick payments</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRCodeLanding;
