import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../services/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : theme === "light" ? "neon" : "dark");
  };

  return (
    <nav className={`nav ${theme}`}>
      <Link to="/" className="brand">AIVORA</Link>

      <div className="links desktop">
        <NavItem to="/home" label="Home" />
        {user && (
          <>
            <NavItem to="/dashboard" label="Dashboard" />
            <NavItem to="/chat" label="Chat" />
            <NavItem to="/skills" label="Skills" />
            <NavItem to="/map" label="Map" />
            <NavItem to="/sos" label="SOS" danger />
          </>
        )}
      </div>

      <div className="right">
        <button className="theme-btn" onClick={toggleTheme}>🎨</button>

        {user ? (
          <div className="profile">
            <img
              src="https://cdn-icons-png.flaticon.com/512/147/147144.png"
              alt="profile"
              onClick={() => setProfileOpen(!profileOpen)}
            />

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  className="dropdown"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <Link to="/profile" onClick={() => setProfileOpen(false)}>Profile</Link>
                  <button onClick={handleLogout}>Logout</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <NavLink className="nav-link" to="/login">Login</NavLink>
        )}

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <NavItem to="/home" label="Home" onClick={() => setMenuOpen(false)} />
            {user && (
              <>
                <NavItem to="/dashboard" label="Dashboard" onClick={() => setMenuOpen(false)} />
                <NavItem to="/chat" label="Chat" onClick={() => setMenuOpen(false)} />
                <NavItem to="/skills" label="Skills" onClick={() => setMenuOpen(false)} />
                <NavItem to="/map" label="Map" onClick={() => setMenuOpen(false)} />
                <NavItem to="/sos" label="SOS" danger onClick={() => setMenuOpen(false)} />
                <NavItem to="/profile" label="Profile" onClick={() => setMenuOpen(false)} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .nav {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 28px;
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .dark { background: rgba(2,6,23,0.9); }
        .light { background: #f8fafc; }
        .neon { background: radial-gradient(circle at top, #4f46e5, #020617); }

        .brand {
          font-size: 1.4rem;
          font-weight: 800;
          color: #6366f1;
          text-decoration: none;
        }

        .links { display: flex; gap: 18px; }

        .nav-link {
          color: #e5e7eb;
          text-decoration: none;
          padding: 6px;
        }

        .light .nav-link { color: #111827; }

        .active { color: #22d3ee; }
        .danger { color: #f87171; }

        .right { display: flex; align-items: center; gap: 14px; }

        .theme-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 6px 10px;
          border-radius: 8px;
          cursor: pointer;
        }

        .profile img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
        }

        .dropdown {
          position: absolute;
          right: 0;
          top: 48px;
          background: rgba(15,23,42,0.95);
          border-radius: 12px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hamburger {
          display: none;
          background: none;
          border: none;
          font-size: 1.6rem;
          cursor: pointer;
        }

        .mobile {
          position: absolute;
          top: 70px;
          left: 0;
          width: 100%;
          background: rgba(2,6,23,0.95);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .desktop { display: none; }
          .hamburger { display: block; }
        }
      `}</style>
    </nav>
  );
}

function NavItem({ to, label, danger, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => {
        let cls = "nav-link";
        if (isActive) cls += " active";
        if (danger) cls += " danger";
        return cls;
      }}
    >
      {label}
    </NavLink>
  );
}
