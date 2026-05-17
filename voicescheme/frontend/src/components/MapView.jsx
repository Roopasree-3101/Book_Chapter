/**
 * MapView.jsx
 * Shows scheme application centres on an India map using Leaflet.js.
 * Uses free OpenStreetMap tiles — no API key needed.
 */

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Key CSC / scheme application centres across India (public info)
const SCHEME_CENTRES = [
  { name: "Common Service Centre — Delhi", lat: 28.6139, lng: 77.209, state: "Delhi" },
  { name: "Common Service Centre — Mumbai", lat: 19.076, lng: 72.8777, state: "Maharashtra" },
  { name: "Common Service Centre — Chennai", lat: 13.0827, lng: 80.2707, state: "Tamil Nadu" },
  { name: "Common Service Centre — Kolkata", lat: 22.5726, lng: 88.3639, state: "West Bengal" },
  { name: "Common Service Centre — Hyderabad", lat: 17.385, lng: 78.4867, state: "Telangana" },
  { name: "Common Service Centre — Bengaluru", lat: 12.9716, lng: 77.5946, state: "Karnataka" },
  { name: "Common Service Centre — Jaipur", lat: 26.9124, lng: 75.7873, state: "Rajasthan" },
  { name: "Common Service Centre — Lucknow", lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh" },
  { name: "Common Service Centre — Patna", lat: 25.5941, lng: 85.1376, state: "Bihar" },
  { name: "Common Service Centre — Bhopal", lat: 23.2599, lng: 77.4126, state: "Madhya Pradesh" },
  { name: "Common Service Centre — Ahmedabad", lat: 23.0225, lng: 72.5714, state: "Gujarat" },
  { name: "Common Service Centre — Chandigarh", lat: 30.7333, lng: 76.7794, state: "Punjab" },
];

// Auto-fit map to India bounds
function FitIndia() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([
      [8.4, 68.7],   // SW corner of India
      [37.6, 97.25], // NE corner of India
    ]);
  }, [map]);
  return null;
}

export default function MapView({ schemes = [] }) {
  // Build a label of matched scheme categories for the popup
  const schemeCategories = [...new Set(schemes.map((s) => s.category))];
  const schemeLabel =
    schemeCategories.length > 0
      ? schemeCategories.join(", ")
      : "Government Schemes";

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
        <p className="text-xs text-blue-700 font-medium">
          📍 Common Service Centres (CSC) — Apply for schemes near you
        </p>
      </div>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "320px", width: "100%" }}
        scrollWheelZoom={false}
        aria-label="Map of India showing scheme application centres"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitIndia />
        {SCHEME_CENTRES.map((centre, i) => (
          <Marker key={i} position={[centre.lat, centre.lng]}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{centre.name}</p>
                <p className="text-gray-500 text-xs mt-1">State: {centre.state}</p>
                {schemeCategories.length > 0 && (
                  <p className="text-blue-600 text-xs mt-1">
                    Apply for: {schemeLabel}
                  </p>
                )}
                <a
                  href="https://locator.csccloud.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 underline mt-1 block"
                >
                  Find nearest CSC ↗
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
