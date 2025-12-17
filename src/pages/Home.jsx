// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../home.css";

import { getLiveNews } from "../services/news";
import { getWeather } from "../services/weather";

// Charts
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Floating AI chat
import AIChat from "../components/AIChat";
import aiAvatar from "../assets/ai-avatar.jpg";

export default function Home() {
  const [news, setNews] = useState([]);
  const [weather, setWeather] = useState(null);
  const [newsError, setNewsError] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  const sparkData = [
    { x: "Mon", v: 40 },
    { x: "Tue", v: 60 },
    { x: "Wed", v: 55 },
    { x: "Thu", v: 75 },
    { x: "Fri", v: 50 },
  ];

  // Fetch NEWS & WEATHER
  useEffect(() => {
    getLiveNews()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNews(data);
        } else {
          setNewsError("No news available.");
        }
      })
      .catch(() => setNewsError("Failed to load news."));

    getWeather("Kolhapur")
      .then((data) => {
        if (data && data.temp !== undefined) {
          setWeather(data);
        } else {
          setWeather(null);
        }
      })
      .catch(() => setWeather(null));
  }, []);

  // Rotate news every 5 seconds
  useEffect(() => {
    if (news.length === 0) return;

    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % news.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [news]);

  const currentNews = news.length > 0 ? news[currentNewsIndex] : null;

  return (
    <div className="home-container">
      <Navbar />
      <div className="widgets-row">
        {/* WEATHER WIDGET */}
        <div className="widget weather-widget">
          <h3>Weather</h3>

          {weather ? (
            <div className="weather-content">
              <div className="weather-main">
                <h2>{weather?.temp ?? "--"}°C</h2>
                <div className="weather-desc">
                  <p>{weather?.description ?? "Unavailable"}</p>
                  <p>{weather?.city ?? "Unknown"}</p>
                </div>
              </div>

              <div className="weather-details">
                <div className="detail-item">
                  <span>💧 Humidity</span>
                  <strong>{weather?.humidity ?? "N/A"}</strong>
                </div>
                <div className="detail-item">
                  <span>💨 Wind</span>
                  <strong>{weather?.wind ?? "N/A"}</strong>
                </div>
              </div>
            </div>
          ) : (
            <p>Weather data unavailable</p>
          )}
        </div>

        {/* SPARKLINE CHART */}
        <div className="widget chart-widget">
          <h3>Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={sparkData}>
              <XAxis hide dataKey="x" />
              <YAxis hide />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <Line dataKey="v" stroke="#00d4ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NEWS SECTION */}
      <div className="news-section">
        <div className="news-header">
          <h2>Live News</h2>
          <div className="news-indicators">
            {news.map((_, i) => (
              <span
                key={i}
                className={`indicator ${
                  i === currentNewsIndex ? "active" : ""
                }`}
              />
            ))}
          </div>
        </div>

        <div className="news-display-area">
          {news.length === 0 && !newsError && <p>Loading news...</p>}
          {newsError && <p style={{ color: "red" }}>{newsError}</p>}

          {currentNews && (
            <div className="news-card animated-card">
              {currentNews?.image && (
                <img src={currentNews.image} alt="news" />
              )}

              <div className="news-info">
                <h4>{currentNews?.title ?? "No title available"}</h4>
                <p>
                  {currentNews?.description ??
                    "No description available"}
                </p>

                {currentNews?.url && (
                  <a
                    href={currentNews.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read Full Story →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING AI BUTTON */}
      <button
        className="ai-button"
        onClick={() => setShowChat(!showChat)}
        title="Ask AI Assistant"
        style={{ padding: 0, overflow: "hidden" }}
      >
        <img
          src={aiAvatar}
          alt="AI"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </button>

      {/* AI CHAT WINDOW */}
      <AIChat open={showChat} onClose={() => setShowChat(false)} />
    </div>
  );
}
