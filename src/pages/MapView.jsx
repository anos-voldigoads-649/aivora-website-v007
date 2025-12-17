import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Helper to center map on location updates automatically
function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

const defaultPosition = [16.7050, 74.2433]; // Kolhapur

export default function MapView() {
  const [position, setPosition] = useState(null); // start null to wait for loc
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      setPosition(defaultPosition);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error("Loc Error:", err);
        setError("Location denied. Showing default.");
        setPosition(defaultPosition);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ padding: 20 }}>
        <h2 style={{ marginBottom: 15 }}>Live Location Map 📍 (Leaflet)</h2>

        {error && (
          <div style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px"
          }}>
            {error}
          </div>
        )}

        {position ? (
          <MapContainer
            center={position}
            zoom={15}
            style={{ height: "80vh", width: "100%", borderRadius: "15px", overflow: "hidden" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <Marker position={position}>
              <Popup>You are here</Popup>
            </Marker>

            <MapRecenter lat={position[0]} lng={position[1]} />
          </MapContainer>
        ) : (
          <div style={{ padding: 40, textAlign: "center", background: "#f3f4f6", borderRadius: "15px" }}>
            <h3>Getting Location...</h3>
          </div>
        )}
      </div>
    </div>
  );
}
