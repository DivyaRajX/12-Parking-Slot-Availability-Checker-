import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from '../components/MapView';

const API = 'http://localhost:8080/api';
const BASE = 'http://localhost:8080';

export default function DriverDashboard({ user, onLogout }) {
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [filters, setFilters] = useState({
    covered: null,
    evCharging: null,
    handicap: null,
  });
  const [distanceKm, setDistanceKm] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [wsUpdates, setWsUpdates] = useState([]);

  useEffect(() => {
    fetchLots();
    connectWebSocket();
  }, []);

  useEffect(() => {
    if (selectedLot) {
      fetchSlots(selectedLot.id);
    }
  }, [selectedLot]);

  useEffect(() => {
    fetchBookings();
  }, [user.id]);

  const fetchLots = async () => {
    try {
      const res = await axios.get(`${BASE}/parking`, { params: filters });
      let data = res.data || [];
      // if distance filter + userLocation available, compute distances and filter
      if (distanceKm && userLocation) {
        const haversine = (lat1, lon1, lat2, lon2) => {
          const toRad = (v) => (v * Math.PI) / 180;
          const R = 6371; // km
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };
        data = data
          .map((d) => ({ ...d, distanceKm: haversine(userLocation.lat, userLocation.lng, d.latitude, d.longitude) }))
          .filter((d) => d.distanceKm <= distanceKm)
          .sort((a, b) => a.distanceKm - b.distanceKm);
      }
      setLots(data);
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

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API}/bookings/user/${user.id}`);
      setBookings(res.data);
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
        // Refresh slots and lot list on slot updates
        if (data.type === 'slot_update') {
          if (selectedLot) fetchSlots(selectedLot.id);
          fetchLots();
          // notify if a booked slot becomes occupied by someone else
          const conflicting = bookings.find((b) => b.slot && b.slot.id === data.slotId && b.status === 'ACTIVE');
          if (conflicting && data.occupied) {
            alert(`Your reserved slot ${data.slotId} is now unavailable.`);
            fetchBookings();
          }
        }
      } catch (e) {}
    };
    return () => ws.close();
  };

  const bookSlot = async (slotId) => {
    try {
      await axios.post(`${API}/bookings`, {
        userId: user.id,
        slotId,
      });
      alert('Booking successful!');
      fetchBookings();
      if (selectedLot) fetchSlots(selectedLot.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed');
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await axios.delete(`${API}/bookings/${bookingId}`);
      alert('Booking cancelled');
      fetchBookings();
      if (selectedLot) fetchSlots(selectedLot.id);
    } catch (err) {
      alert('Cancellation failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">🅿️ ParkHub Driver</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters & Lots */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Search Parking</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.covered === true}
                    onChange={(e) =>
                      setFilters({ ...filters, covered: e.target.checked ? true : null })
                    }
                    className="mr-2"
                  />
                  <span>Covered</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.evCharging === true}
                    onChange={(e) =>
                      setFilters({ ...filters, evCharging: e.target.checked ? true : null })
                    }
                    className="mr-2"
                  />
                  <span>EV Charging</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.handicap === true}
                    onChange={(e) =>
                      setFilters({ ...filters, handicap: e.target.checked ? true : null })
                    }
                    className="mr-2"
                  />
                  <span>Handicap</span>
                </label>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="number"
                  placeholder="Distance km (optional)"
                  value={distanceKm || ''}
                  onChange={(e) => setDistanceKm(e.target.value ? Number(e.target.value) : null)}
                  className="w-1/2 px-2 py-2 border rounded"
                />
                <button
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                        fetchLots();
                      });
                    } else {
                      alert('Geolocation not available');
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Use My Location
                </button>
              </div>
              <button
                onClick={fetchLots}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Search
              </button>
            </div>

            {/* Map View */}
            <div className="mb-4">
              <MapView parkingLots={lots} onSelect={(lot) => setSelectedLot(lot)} />
            </div>

            {/* Parking Lots List */}
            <div className="space-y-4">
              {lots.map((lot) => (
                <div
                  key={lot.id}
                  onClick={() => setSelectedLot(lot)}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition ${
                    selectedLot?.id === lot.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <h3 className="text-lg font-semibold">{lot.name}</h3>
                  <p className="text-sm text-gray-600">
                    📍 {lot.latitude.toFixed(4)}, {lot.longitude.toFixed(4)}
                  </p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>Total: {lot.totalSlots}</span>
                    <span className="text-green-600 font-semibold">Available: {lot.availableSlots}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slots & Bookings */}
          <div className="space-y-6">
            {selectedLot && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">Available Slots</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3 rounded border ${
                        slot.occupied
                          ? 'bg-red-100 border-red-300'
                          : 'bg-green-100 border-green-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Slot {slot.id}</span>
                        {!slot.occupied && (
                          <button
                            onClick={() => bookSlot(slot.id)}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          >
                            Book
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {slot.covered ? '🏠 Covered' : ''} {slot.evCharging ? '⚡ EV' : ''}{' '}
                        {slot.handicap ? '♿ Accessible' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Bookings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">My Bookings</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {bookings.length === 0 ? (
                  <p className="text-gray-600 text-sm">No bookings yet</p>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="font-semibold text-sm">Slot {booking.slot?.id}</p>
                      <p className="text-xs text-gray-600">{booking.status}</p>
                      {booking.status === 'ACTIVE' && (
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          className="text-xs text-red-600 hover:text-red-800 mt-1"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Real-time Updates */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Updates</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto text-xs">
                {wsUpdates.map((update, i) => (
                  <div key={i} className="p-2 bg-gray-100 rounded">
                    Slot {update.slotId}: {update.occupied ? '❌ Occupied' : '✅ Available'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
