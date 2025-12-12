import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";

export default function MapView() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if script already exists
    if (window.google?.maps) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_API_KEY}`;
    script.async = true;
    script.onload = initMap;
    script.onerror = () => setError("Failed to load Google Maps script.");
    document.body.appendChild(script);
  }, []);

  function initMap() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        renderMap({ lat: latitude, lng: longitude }, "You are here");
        watchUserLocation();
      },
      (err) => {
        console.error(err);
        setError("Location permission denied. Showing default location (Kolhapur).");
        // Fallback to Kolhapur
        const kolhapur = { lat: 16.7050, lng: 74.2433 };
        renderMap(kolhapur, "Kolhapur (Default)");
      }
    );
  }

  function renderMap(location, title) {
    if (mapRef.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 15,
        mapTypeId: "roadmap",
        styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            }
        ]
      });

      markerInstance.current = new window.google.maps.Marker({
        position: location,
        map: mapInstance.current,
        title: title,
        animation: window.google.maps.Animation.DROP,
      });
    }
  }

  function watchUserLocation() {
    navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newLoc = { lat: latitude, lng: longitude };

        if (mapInstance.current && markerInstance.current) {
          markerInstance.current.setPosition(newLoc);
          mapInstance.current.panTo(newLoc);
        }
      },
      (err) => console.error("Watch Position Error:", err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: 20 }}>
        <h2 style={{ marginBottom: 15 }}>Live Location Map 📍</h2>
        
        {error && (
          <div style={{ 
            background: "#ffdddd", 
            borderLeft: "6px solid #f44336", 
            padding: "10px", 
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span><strong>Error:</strong> {error}</span>
            <button 
              onClick={() => { setError(null); initMap(); }}
              style={{
                background: "#d32f2f",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Retry Location
            </button>
          </div>
        )}

        <div
          ref={mapRef}
          style={{
            width: "100%",
            height: "80vh",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </div>
  );
}
