import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to mock coordinates for localhost/unknown
const getCoordinates = (log) => {
  if (log.country === 'Unknown' || log.ipAddress === '::1' || log.ipAddress === '127.0.0.1') {
    // Return a default location (e.g., somewhere in the Atlantic) or random
    return [35.0 + Math.random() * 10, -40.0 + Math.random() * 10];
  }
  // In a real app with geoip-lite full data, you'd save lat/ll to the DB.
  // We'll mock coordinates based on some basic hash of the country name if real ones aren't available
  const hash = log.country ? log.country.charCodeAt(0) : 0;
  return [20 + (hash % 40), -100 + (hash % 180)];
};

const WorldMap = ({ logs }) => {
  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%', background: '#0f172a' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {logs.slice(0, 50).map((log, index) => {
          const position = getCoordinates(log);
          return (
            <Marker key={index} position={position}>
              <Popup className="bg-slate-900 border-slate-700 text-slate-200">
                <div className="font-semibold text-cyan-400">{log.username}</div>
                <div className="text-sm">IP: {log.ipAddress}</div>
                <div className="text-sm">Status: {log.success ? 'Success' : 'Failed'}</div>
                <div className="text-xs text-slate-400 mt-1">{new Date(log.createdAt).toLocaleString()}</div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default WorldMap;
