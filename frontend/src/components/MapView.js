import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DefaultIcon = new L.Icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function FitBounds({ items }) {
  const map = useMap();
  useEffect(() => {
    if (!items || items.length === 0) return;
    const bounds = items.map((i) => [i.latitude, i.longitude]);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [items, map]);
  return null;
}

export default function MapView({ parkingLots = [], onSelect }) {
  const center = parkingLots && parkingLots.length > 0
    ? [parkingLots[0].latitude, parkingLots[0].longitude]
    : [40.7128, -74.0060];

  return (
    <div style={{ height: '420px', borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds items={parkingLots} />
        {parkingLots.map((lot) => (
          <Marker
            key={lot.id}
            position={[lot.latitude, lot.longitude]}
            icon={DefaultIcon}
            eventHandlers={{ click: () => onSelect && onSelect(lot) }}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <strong>{lot.name}</strong>
                <div>Capacity: {lot.totalSlots}</div>
                <div>Available: {lot.availableSlots}</div>
                <div style={{ fontSize: 12, color: '#555' }}>
                  {lot.covered ? 'Covered ' : ''}{lot.evCharging ? '• EV ' : ''}{lot.handicap ? '• ♿' : ''}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
