import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../services/AuthContext";
import { db } from "../services/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const [profession, setProfession] = useState("");
  const [dark, setDark] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfession = async () => {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        setProfession(snapshot.data().profession || "Not set");
      }
    };

    fetchProfession();
  }, [user]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: dark
          ? "linear-gradient(-45deg, #020617, #0f172a, #1e1b4b)"
          : "linear-gradient(-45deg, #e0e7ff, #fdf2f8, #ecfeff)",
        backgroundSize: "400% 400%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        animation: "gradientBG 12s ease infinite",
        color: dark ? "#e5e7eb" : "#111827",
        transition: "0.3s",
      }}
    >
      <style>
        {`
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>

      <Navbar />

      <div style={{ padding: "35px", maxWidth: "1200px", margin: "auto" }}>
        {/* TOGGLE */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => setDark(!dark)}
            style={{
              background: "transparent",
              border: "1px solid",
              borderColor: dark ? "#6366f1" : "#7c3aed",
              color: "inherit",
              padding: "8px 14px",
              borderRadius: "999px",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            {dark ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background:
              "linear-gradient(135deg, #6366f1, #22d3ee, #8b5cf6)",
            padding: "30px",
            borderRadius: "22px",
            marginBottom: "40px",
            boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
          }}
        >
          <h2 style={{ fontSize: "30px", marginBottom: "10px" }}>
            Welcome, {user?.email || "User"} 👋
          </h2>
          <p style={{ marginBottom: "8px" }}>
            <b>Profession:</b> {profession}
          </p>
          <p style={{ opacity: 0.9 }}>Your AI-powered control center</p>
        </motion.div>

        {/* CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "28px",
          }}
        >
          <FeatureCard dark={dark} icon="🤖" title="AI Chat" desc="Smart AI conversations." link="/chat" />
          <FeatureCard dark={dark} icon="🚨" title="Emergency SOS" desc="Instant emergency help." link="/sos" />
          <FeatureCard dark={dark} icon="📚" title="Skill Growth" desc="Upgrade your skills." link="/skills" />
          <FeatureCard dark={dark} icon="🗺️" title="Live Map" desc="Nearby help & tracking." link="/map" />
          <FeatureCard dark={dark} icon="⚙️" title="Profile" desc="Manage your account." link="/profile" />
        </div>
      </div>
    </div>
  );
}

/* CARD */
function FeatureCard({ icon, title, desc, link, dark }) {
  return (
    <Link to={link} style={{ textDecoration: "none", color: "inherit" }}>
      <motion.div
        whileHover={{ scale: 1.05, y: -6 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        style={{
          position: "relative",
          padding: "28px",
          borderRadius: "20px",
          background: dark
            ? "rgba(17, 24, 39, 0.8)"
            : "rgba(255,255,255,0.8)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
      >
        {/* NEON BORDER */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "20px",
            padding: "2px",
            background:
              "linear-gradient(120deg, #22d3ee, #6366f1, #ec4899)",
            animation: "neon 4s linear infinite",
            mask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
          }}
        />

        <style>
          {`
            @keyframes neon {
              0% { filter: hue-rotate(0deg); }
              100% { filter: hue-rotate(360deg); }
            }
          `}
        </style>

        <div style={{ fontSize: "34px", marginBottom: "12px" }}>{icon}</div>
        <h3 style={{ marginBottom: "8px" }}>{title}</h3>
        <p style={{ color: dark ? "#9ca3af" : "#4b5563" }}>{desc}</p>
      </motion.div>
    </Link>
  );
}
