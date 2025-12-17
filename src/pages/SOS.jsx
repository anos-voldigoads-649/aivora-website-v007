import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";



// Auto center helper
function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function SOS() {
  // Use [lat, lng] array for Leaflet
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [numbers, setNumbers] = useState([]);

  /* ---------------- LOAD SAVED NUMBERS ---------------- */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("sosNumbers")) || [];
    setNumbers(saved);
  }, []);

  /* ---------------- GEO LOCATION ---------------- */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Leaflet uses [lat, lng]
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
      },
      () => setStatus("❌ Location permission denied")
    );
  }, []);

  /* ---------------- PHONE MANAGEMENT ---------------- */
  function addNumber() {
    if (!phone || !phone.startsWith("+")) {
      alert("Enter valid phone number with country code");
      return;
    }
    if (numbers.includes(phone)) return;

    const updated = [...numbers, phone];
    setNumbers(updated);
    localStorage.setItem("sosNumbers", JSON.stringify(updated));
    setPhone("");
  }

  function removeNumber(num) {
    const updated = numbers.filter((n) => n !== num);
    setNumbers(updated);
    localStorage.setItem("sosNumbers", JSON.stringify(updated));
  }

  /* ---------------- TRIGGER SOS ---------------- */
  const [shareLink, setShareLink] = useState(null);

  async function triggerSOS() {
    if (!location) return setStatus("Location unavailable");
    if (numbers.length === 0) return setStatus("Add at least one number");

    setStatus("🚨 Sending SOS...");

    // 1. Start Live Tracking (Localhost)
    const sosId = crypto.randomUUID();
    setShareLink(`${window.location.origin}/track/${sosId}`);

    navigator.geolocation.watchPosition(
      (pos) => {
        fetch("http://localhost:5000/sos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sosId,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        }).catch(e => console.error("Tracking upload failed", e));
      },
      console.error,
      { enableHighAccuracy: true }
    );

    // 2. Send Alerts (Netlify Function)
    try {
      const res = await fetch("/.netlify/functions/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location, // { lat: ..., lng: ... }
          numbers,
          trackLink: `${window.location.origin}/track/${sosId}`
        }),
      });

      if (res.ok) {
        setStatus("🚨 SOS SENT & TRACKING ACTIVE!");
      } else {
        const text = await res.text();
        setStatus(`FAILED: ${text}`);
      }
    } catch (err) {
      setStatus("❌ Network error");
    }
  }

  return (
    <div className="sos-root">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sos-card"
      >
        <h1>🚨 Emergency SOS</h1>

        {/* TRACKING LINK */}
        {shareLink && (
          <div style={{ 
            background: "#fff", 
            color: "#000", 
            padding: 15, 
            borderRadius: 10, 
            marginBottom: 20,
            wordBreak: "break-all"
          }}>
            <strong>🔴 Live Tracking Active:</strong><br/>
            <a href={shareLink} target="_blank" rel="noreferrer" style={{ color: "blue" }}>
              {shareLink}
            </a>
          </div>
        )}

        {/* PHONE INPUT */}
        <div className="phone-box">
          <input
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={addNumber}>Add</button>
        </div>

        {/* SAVED NUMBERS */}
        <div className="numbers">
          {numbers.map((n) => (
            <div key={n} className="num">
              {n}
              <span onClick={() => removeNumber(n)}>✕</span>
            </div>
          ))}
        </div>

        {/* SOS BUTTON */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          animate={{ boxShadow: ["0 0 15px red", "0 0 40px red"] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          onClick={triggerSOS}
          className="sos-btn"
        >
          SEND SOS
        </motion.button>

        <div className="status">{status}</div>

        <div className="map-box">
          {location ? (
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={16}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                attribution="OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[location.lat, location.lng]}>
                 <Popup>Your Location</Popup>
              </Marker>
              <Recenter lat={location.lat} lng={location.lng} />
            </MapContainer>
          ) : (
            <div style={{ color: "#aaa", paddingTop: 100 }}>
               Getting Location...
            </div>
          )}
        </div>
      </motion.div>

      <style>{`
        .sos-root {
          min-height: 100vh;
          background: linear-gradient(to bottom, #7f1d1d, #020617);
          color: white;
        }
        .sos-card {
          max-width: 800px;
          margin: auto;
          padding: 40px 20px;
          text-align: center;
        }
        .phone-box {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 10px;
        }
        input {
          padding: 10px;
          border-radius: 8px;
          border: none;
          width: 200px;
        }
        button {
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          background: #dc2626;
          color: white;
          cursor: pointer;
        }
        .numbers {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .num {
          background: rgba(255,255,255,0.15);
          padding: 6px 12px;
          border-radius: 20px;
          display: flex;
          gap: 6px;
        }
        .num span {
          cursor: pointer;
          color: #fca5a5;
        }
        .sos-btn {
          width: 220px;
          height: 220px;
          border-radius: 50%;
          font-size: 24px;
          font-weight: bold;
          background: radial-gradient(circle, #ff0000, #7f1d1d);
          border: none;
          color: white;
          cursor: pointer;
        }
        .map-box {
          margin-top: 25px;
          height: 300px;
          border-radius: 16px;
          overflow: hidden;
          background: #222;
        }
        .status {
          margin-top: 20px;
          font-weight: bold;
          font-size: 1.2rem;
        }
      `}</style>
    </div>
  );
}
