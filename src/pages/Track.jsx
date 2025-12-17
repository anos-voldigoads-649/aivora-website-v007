import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "leaflet/dist/leaflet.css";

const Track = () => {
  const { id } = useParams();
  const [pos, setPos] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:5000/sos/${id}`);
        if (res.ok) {
            const data = await res.json();
            if (data && data.lat && data.lng) {
              setPos([data.lat, data.lng]);
            }
        }
      } catch (err) {
        console.error("Tracking error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  if (!pos) return (
    <div style={{ padding: 40, textAlign: "center" }}>
        <h2>⏳ Waiting for live location...</h2>
        <p>The sender hasn't shared a location yet, or the stream has stopped.</p>
    </div>
  );

  return (
    <div style={{ height: "100vh", width: "100%" }}>
         <MapContainer center={pos} zoom={16} style={{ height: "100%", width: "100%" }}>
          <TileLayer 
            attribution="OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          />
          <Marker position={pos}>
            <Popup>Create Live Location</Popup>
          </Marker>
        </MapContainer>
        
        <div style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            zIndex: 9999,
            background: "white",
            padding: "10px 15px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
        }}>
            <h4 style={{ margin: 0 }}>🔴 Live Tracking</h4>
            <small>Updates every 3s</small>
        </div>
    </div>
  );
};

export default Track;
