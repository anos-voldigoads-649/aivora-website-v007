// src/pages/SOS.jsx
import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { auth, db } from "../services/AuthContext";
import { collection, addDoc, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import { sendSOS } from "../services/api";

export default function SOS() {
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [editing, setEditing] = useState(null); // contact id or null
  const [form, setForm] = useState({ name: "", phone: "" });
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const user = auth.currentUser;

  // Load Google Maps script (only once)
  useEffect(() => {
    if (!window.google) {
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_API_KEY}&libraries=places`;
      s.async = true;
      s.onload = () => initGeolocation();
      document.head.appendChild(s);
    } else {
      initGeolocation();
    }
    // load contacts for current user
    if (user) loadContacts();
    // eslint-disable-next-line
  }, [user]);

  // Load contacts from Firestore (collection: users/{uid}/sosContacts)
  async function loadContacts() {
    try {
      const uid = auth.currentUser.uid;
      const col = collection(db, "users", uid, "sosContacts");
      const snap = await getDocs(col);
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setContacts(arr);
    } catch (err) {
      console.error("Load contacts error", err);
    }
  }

  function initGeolocation() {
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported");
      return;
    }
    setStatus("Getting location...");
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setStatus("");
        renderMap(loc);
      },
      () => setStatus("Permission denied")
    );
  }

  function renderMap(loc) {
    if (!mapRef.current || !window.google) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: loc,
      zoom: 15,
    });

    markerRef.current = new window.google.maps.Marker({
      position: loc,
      map,
      title: "Your Location",
    });
  }

  // Add contact to Firestore
  async function addContact(e) {
    e.preventDefault();
    if (!form.name || !form.phone) return alert("Enter name & phone");
    try {
      const uid = auth.currentUser.uid;
      const col = collection(db, "users", uid, "sosContacts");
      await addDoc(col, { name: form.name, phone: form.phone });
      setForm({ name: "", phone: "" });
      loadContacts();
    } catch (err) {
      console.error("Add contact error", err);
      alert("Failed to add contact");
    }
  }

  // Start editing contact
  function startEdit(c) {
    setEditing(c.id);
    setForm({ name: c.name, phone: c.phone });
  }

  // Save edit
  async function saveEdit(e) {
    e.preventDefault();
    try {
      const uid = auth.currentUser.uid;
      await setDoc(doc(db, "users", uid, "sosContacts", editing), {
        name: form.name,
        phone: form.phone,
      });
      setEditing(null);
      setForm({ name: "", phone: "" });
      loadContacts();
    } catch (err) {
      console.error("Save edit error", err);
      alert("Failed to save");
    }
  }

  // Delete
  async function removeContact(id) {
    if (!confirm("Delete contact?")) return;
    try {
      const uid = auth.currentUser.uid;
      await deleteDoc(doc(db, "users", uid, "sosContacts", id));
      loadContacts();
    } catch (err) {
      console.error("Delete error", err);
      alert("Failed to delete");
    }
  }

  // Trigger SOS — calls backend Netlify function
  async function triggerSOS() {
    if (!location) return setStatus("Location not available");
    if (!contacts.length) return setStatus("No SOS contacts. Add at least one.");

    setStatus("Sending SOS...");
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

      // send payload to backend: { contacts: [{name,phone}], location }
      const payload = { contacts, location };

      const res = await sendSOS(token, payload); // frontend helper uses BASE /.netlify/functions
      // sendSOS returns { ok: true, results: [...] } or throws
      if (res?.ok) {
        setStatus("🚨 SOS sent successfully!");
      } else {
        setStatus("Failed to send SOS");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error sending SOS");
    }
  }

  return (
    <div>
      <Navbar />

      <div style={{ padding: 20 }}>
        <h2>Emergency SOS</h2>

        {/* Map */}
        <div
          ref={mapRef}
          style={{
            width: "100%",
            height: "360px",
            borderRadius: 10,
            marginBottom: 12,
            border: "1px solid #ddd",
          }}
        />

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          {/* Left: contacts / form */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <h3>Your SOS Contacts</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {contacts.map(c => (
                <div key={c.id} style={{ padding: 10, background: "#fafafa", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{c.name}</strong>
                    <div style={{ fontSize: 13 }}>{c.phone}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => startEdit(c)}>Edit</button>
                    <button onClick={() => removeContact(c.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && <div>No contacts yet. Add one below.</div>}
            </div>

            <div style={{ marginTop: 18 }}>
              <h4>{editing ? "Edit contact" : "Add contact"}</h4>
              <form onSubmit={editing ? saveEdit : addContact} style={{ display: "grid", gap: 8 }}>
                <input placeholder="Name" value={form.name} onChange={e => setForm(s => ({...s, name: e.target.value}))} />
                <input placeholder="+91xxxxxxxxxx" value={form.phone} onChange={e => setForm(s => ({...s, phone: e.target.value}))} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit">{editing ? "Save" : "Add"}</button>
                  {editing && <button type="button" onClick={() => { setEditing(null); setForm({name:"", phone:""}); }}>Cancel</button>}
                </div>
              </form>
            </div>
          </div>

          {/* Right: SOS actions */}
          <div style={{ width: 360 }}>
            <div style={{ marginBottom: 12 }}>
              <strong>Current Location:</strong>
              <div>{location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : "Not available"}</div>
            </div>

            <button
              onClick={triggerSOS}
              style={{
                background: "red",
                color: "white",
                padding: "14px 18px",
                borderRadius: 10,
                fontSize: 18,
                width: "100%",
                fontWeight: "bold",
              }}
            >
              SEND SOS 🚨
            </button>

            <div style={{ marginTop: 10, color: status.startsWith("🚨") ? "crimson" : "inherit" }}>{status}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
