import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Car, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const primaryCta = () => {
    if (!currentUser) return navigate('/login');
    return navigate('/user-dashboard');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Animated blobs */}
      <div className="absolute -top-32 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" />
      <div className="absolute -bottom-32 -right-24 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse [animation-delay:1.2s]" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">SK Car Rental</h1>
            <p className="text-xs text-gray-500">Drive your dream today</p>
          </div>
        </div>
        <div className="space-x-3">
          {!currentUser && (
            <>
              <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Sign in</button>
              <button onClick={() => navigate('/signup')} className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow">Create account</button>
            </>
          )}
          {currentUser && (
            <button onClick={() => navigate('/user-dashboard')} className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow">Go to dashboard</button>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-blue-700 to-green-700 bg-clip-text text-transparent">
            Premium cars. Flexible rentals. Effortless experience.
          </h2>
          <p className="mt-6 text-lg text-gray-600">
            Explore a curated fleet and hit the road with confidence. Secure, fast, and made for modern drivers.
          </p>
          <div className="mt-8 flex items-center space-x-3">
            <button onClick={primaryCta} className="inline-flex items-center px-6 py-3 rounded-xl text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg">
              {currentUser ? 'Browse cars' : 'Get started'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button onClick={() => navigate('/user-dashboard')} className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-50">
              View vehicles
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-700">Verified documents & secure payments</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-700">Modern UI with real‑time updates</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-to-br from-blue-200 to-green-200 blur-3xl opacity-50 rounded-3xl" />
          <div className="relative bg-white/80 backdrop-blur border border-white/30 rounded-3xl shadow-2xl p-6">
            <img src="/car-hero.png" alt="Car" className="rounded-2xl w-full object-cover" onError={(e)=>{e.currentTarget.style.display='none';}} />
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-gray-600">Weekly from</p>
                <p className="text-lg font-bold text-blue-700">$150</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-gray-600">Bond</p>
                <p className="text-lg font-bold text-green-700">$1000</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3">
                <p className="text-gray-600">Cars</p>
                <p className="text-lg font-bold text-yellow-700">20+</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center text-xs text-gray-500 pb-8">© {new Date().getFullYear()} SK Car Rental</footer>
    </div>
  );
}


