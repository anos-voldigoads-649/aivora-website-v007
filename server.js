import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/chat", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(req.body.message);
    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

import twilio from "twilio";

// ... (previous code)

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/* ================= SOS TRACKING ================= */
const sosLocations = {}; // In-memory storage

// TRACKING UPDATE
app.post("/sos", (req, res) => {
  const { sosId, lat, lng } = req.body;
  if(sosId) {
      sosLocations[sosId] = { lat, lng, updated: Date.now() };
  }
  res.sendStatus(200);
});

// TRACKING RETRIEVE
app.get("/sos/:id", (req, res) => {
  res.json(sosLocations[req.params.id] || null);
});

// ALERT (SMS + CALL)
app.post("/api/sos/alert", async (req, res) => {
  try {
    const { location, numbers, trackLink } = req.body;
    
    // ... (rest of alert logic) ...
    // Note: To save tokens/lines in this Replace call, I'm assuming context is sufficient. 
    // Actually, I should just append the new route before the listener.
    // Let's rewrite the block around line 40 to insert the new route safely.
    
    const link = trackLink || `https://maps.google.com/?q=${location.lat},${location.lng}`;
    const msg = `🚨 EMERGENCY ALERT\nLive Location:\n${link}\nPlease respond immediately.`;

    const promises = numbers.map(async (phone) => {
      await client.messages.create({ from: process.env.TWILIO_PHONE, to: phone, body: msg });
      await client.calls.create({
        from: process.env.TWILIO_PHONE,
        to: phone,
        twiml: `<Response><Say voice="alice">Emergency alert. Please check the message for live location.</Say></Response>`,
      });
    });

    await Promise.all(promises);
    res.json({ ok: true });

  } catch (err) {
    console.error("Twilio Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= SKILL GENERATION (LOCAL) ================= */
app.post("/api/generateSkill", async (req, res) => {
  try {
    const { field } = req.body;
    if (!field) return res.status(400).json({ error: "Field is required" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Create a step-by-step learning roadmap for: "${field}".
      Return ONLY a raw JSON array of strings. 
      Example: ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]
      Do not include markdown formatting like \`\`\`json.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let steps;
    try {
      steps = JSON.parse(cleanText);
    } catch {
      steps = cleanText.split("\n").filter(s => s.trim().length > 0);
    }

    res.json({ steps });
  } catch (err) {
    console.error("Skill Gen Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Backend running at http://localhost:5000");
});
