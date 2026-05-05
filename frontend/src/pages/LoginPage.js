import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:8080/api';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('driver@test.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('DRIVER');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('John Driver');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        const res = await axios.post(`${API}/auth/register`, {
          name,
          email,
          password,
          role,
        });
        onLogin({ id: res.data.id, name, email, role });
      } else {
        const res = await axios.post(`${API}/auth/login`, { email, password });
        onLogin(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🅿️ ParkHub</h1>
        <p className="text-gray-600 mb-6">Find and manage parking easily</p>

        <div className="flex gap-2 mb-6">
          <label className="flex items-center">
            <input
              type="radio"
              value="DRIVER"
              checked={role === 'DRIVER'}
              onChange={(e) => setRole(e.target.value)}
              className="mr-2"
            />
            <span>Driver</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="MANAGER"
              checked={role === 'MANAGER'}
              onChange={(e) => setRole(e.target.value)}
              className="mr-2"
            />
            <span>Manager</span>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <button
          onClick={() => setIsRegister(!isRegister)}
          className="w-full mt-4 text-blue-500 hover:text-blue-600 font-semibold"
        >
          {isRegister ? 'Already have account? Login' : 'Create account'}
        </button>

        <p className="text-gray-600 text-xs mt-4">Demo: {role === 'DRIVER' ? 'driver@test.com' : 'manager@test.com'} / password123</p>
      </div>
    </div>
  );
}
