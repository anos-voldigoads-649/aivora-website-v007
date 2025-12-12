// src/services/api.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "/.netlify/functions";

export async function postAIChat(token, text) {
  try {
    const res = await axios.post(
      `${BASE}/aiChat`,
      { text },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return res.data;
  } catch (err) {
    console.error("AI Chat error:", err);
    throw err;
  }
}

export async function sendSOS(token, location) {
  return fetch("http://localhost:5000/api/sos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify(location),
  });
}

export async function generateSkill(token, profile) {
  try {
    const res = await axios.post(
      `${BASE}/generateSkill`,
      { profile },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return res.data;
  } catch (err) {
    console.error("Skill generation error:", err);
    throw err;
  }
}
