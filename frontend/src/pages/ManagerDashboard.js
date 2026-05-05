import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from '../components/MapView';

const API = 'http://localhost:8080/api/manager';
const BASE = 'http://localhost:8080';

export default function ManagerDashboard({ user, onLogout }) {
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    latitude: 40.7128,
    longitude: -74.006,
    numSlots: 10,
  });
  const [wsUpdates, setWsUpdates] = useState([]);

  useEffect(() => {
    fetchLots();
    connectWebSocket();
  }, []);

  useEffect(() => {
    if (selectedLot) {
      fetchSlots(selectedLot.id);
      fetchAnalytics(selectedLot.id);
    }
  }, [selectedLot]);

  const fetchLots = async () => {
    try {
      const res = await axios.get(`${BASE}/parking`);
      setLots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSlots = async (lotId) => {
    try {
      const res = await axios.get(`${BASE}/parking/${lotId}/slots`);
      setSlots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async (lotId) => {
    try {
      const res = await axios.get(`${API}/analytics/${lotId}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8080/ws/slots');
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        setWsUpdates((m) => [data, ...m].slice(0, 10));
        if (selectedLot && data.type === 'slot_update') {
          fetchSlots(selectedLot.id);
          fetchAnalytics(selectedLot.id);
        }
      } catch (e) {}
    };
    return () => ws.close();
  };

  const createParkingLot = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/parking`, formData);
      alert('Parking lot registered!');
      setFormData({ name: '', latitude: 40.7128, longitude: -74.006, numSlots: 10 });
      setShowCreateForm(false);
      fetchLots();
    } catch (err) {
      alert('Error creating parking lot');
    }
  };

  const updateSlotStatus = async (slotId, occupied) => {
    try {
      await axios.put(`${API}/slots/${slotId}/status`, { occupied });
      if (selectedLot) {
        fetchSlots(selectedLot.id);
        fetchAnalytics(selectedLot.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">🏢 ParkHub Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user.name}</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Create Parking Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Register New Parking Lot</h2>
            <form onSubmit={createParkingLot} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Parking Lot Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                step="0.0001"
                placeholder="Latitude"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                required
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                step="0.0001"
                placeholder="Longitude"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                required
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Number of Slots"
                value={formData.numSlots}
                onChange={(e) => setFormData({ ...formData, numSlots: parseInt(e.target.value) })}
                required
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="col-span-2 bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Register Lot
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="col-span-2 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="mb-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
          >
            + Register New Parking Lot
          </button>
        )}

        {/* Map View */}
        {lots.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Parking Lot Locations</h2>
            <MapView parkingLots={lots} onSelect={(lot) => setSelectedLot(lot)} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Parking Lots List */}
          <div>
            <h2 className="text-xl font-bold mb-4">My Parking Lots</h2>
            <div className="space-y-3">
              {lots.map((lot) => (
                <div
                  key={lot.id}
                  onClick={() => setSelectedLot(lot)}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition ${
                    selectedLot?.id === lot.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <h3 className="font-semibold">{lot.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    📍 {lot.latitude.toFixed(4)}, {lot.longitude.toFixed(4)}
                  </p>
                  <div className="flex justify-between text-xs mt-2">
                    <span>Total: {lot.totalSlots}</span>
                    <span className="text-green-600">Available: {lot.availableSlots}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics & Status */}
          {selectedLot && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">📊 Occupancy Analytics</h3>
                {analytics && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="text-gray-600">Total Slots</p>
                      <p className="text-3xl font-bold text-blue-600">{analytics.total}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded">
                      <p className="text-gray-600">Available</p>
                      <p className="text-3xl font-bold text-green-600">{analytics.available}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded">
                      <p className="text-gray-600">Occupied</p>
                      <p className="text-3xl font-bold text-red-600">{analytics.occupied}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded">
                      <p className="text-gray-600 text-sm">Slot Types</p>
                      <ul className="text-xs mt-2 space-y-1">
                        <li>🏠 Covered: {analytics.covered}</li>
                        <li>⚡ EV Charging: {analytics.evCharging}</li>
                        <li>♿ Handicap: {analytics.handicap}</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Slot Management */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">Manage Slots ({slots.length})</h3>
                <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => updateSlotStatus(slot.id, !slot.occupied)}
                      className={`p-3 rounded border-2 transition text-center text-xs font-semibold ${
                        slot.occupied
                          ? 'bg-red-500 border-red-600 text-white hover:bg-red-600'
                          : 'bg-green-500 border-green-600 text-white hover:bg-green-600'
                      }`}
                      title={`${slot.covered ? 'Covered ' : ''}${slot.evCharging ? 'EV ' : ''}${slot.handicap ? 'Accessible' : ''}`}
                    >
                      <div className="font-bold">{slot.id}</div>
                      <div className="text-xs mt-1">
                        {slot.covered ? '🏠' : ''}{slot.evCharging ? '⚡' : ''}{slot.handicap ? '♿' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Real-time Updates */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Real-Time Updates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {wsUpdates.map((update, i) => (
              <div key={i} className="p-3 bg-gray-100 rounded text-sm">
                <p className="font-semibold">Slot {update.slotId}</p>
                <p className={update.occupied ? 'text-red-600' : 'text-green-600'}>
                  {update.occupied ? '❌ Now Occupied' : '✅ Now Available'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
