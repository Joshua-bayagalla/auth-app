import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!newPassword || newPassword.length < 6) {
      setMsg('Password must be at least 6 characters.');
      return;
    }
    try {
      setSaving(true);
      const resp = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, newPassword })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to update password');
      setMsg('Password updated successfully');
      setNewPassword('');
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Profile</h2>
        <div className="text-sm text-gray-700 mb-4">
          <p>Email: <span className="font-mono">{currentUser?.email}</span></p>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <label className="block text-sm">New Password</label>
          <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" className="w-full border rounded-lg px-3 py-2" />
          <button disabled={saving} className={`w-full py-2 rounded-lg text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{saving ? 'Saving...' : 'Update Password'}</button>
        </form>
        {msg && (<p className="mt-3 text-center text-sm text-gray-700">{msg}</p>)}
        <div className="mt-6 text-center">
          <button onClick={logout} className="text-red-600 hover:underline">Logout</button>
        </div>
      </div>
    </div>
  );
}


