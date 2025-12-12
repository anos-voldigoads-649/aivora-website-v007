import express from "express";
import cors from "cors";
import twilio from "twilio";

const app = express();
app.use(cors());
app.use(express.json());

// Twilio Credentials
// REPLACE THESE WITH YOUR ACTUAL TWILIO CREDENTIALS
const client = twilio(
  "TWILIO_ACCOUNT_SID", 
  "TWILIO_AUTH_TOKEN"
);

// Fallback receiver if no contacts provided
const DEFAULT_RECEIVER = "+91XXXXXXXXXX"; 

app.post("/api/sos", async (req, res) => {
  // Support both nested structure (from new SOS.jsx) and flat structure
  const { location, contacts } = req.body;
  const lat = location?.lat || req.body.lat;
  const lng = location?.lng || req.body.lng;

  if (!lat || !lng) {
    return res.status(400).send("Missing location data");
  }

  // Determine recipients: use provided contacts or fallback
  const recipients = (contacts && contacts.length > 0) 
    ? contacts.map(c => c.phone) 
    : [DEFAULT_RECEIVER];

  try {
    const promises = recipients.map(phone => {
      return client.messages.create({
        from: "+1XXXXXXXXXX", // Your Twilio Number
        to: phone,
        body: `🚨 SOS Alert!\nLocation: https://maps.google.com/?q=${lat},${lng}`
      });
    });

    await Promise.all(promises);

    res.send("SOS sent successfully");
  } catch (e) {
    console.error("Twilio Error:", e);
    res.status(500).send("Failed to send SOS");
  }
});

app.listen(5000, () => console.log("SOS server running on port 5000"));
