const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.handler = async (event) => {
  // ✅ CORS HEADERS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // ✅ Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "OK",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: "Method Not Allowed",
    };
  }

  try {
    const { location, numbers } = JSON.parse(event.body);

    const mapLink = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    const msg =
      `🚨 EMERGENCY ALERT\nLive Location:\n${mapLink}\nPlease respond immediately.`;

    for (const phone of numbers) {
      // SMS
      await client.messages.create({
        from: process.env.TWILIO_PHONE,
        to: phone,
        body: msg,
      });

      // CALL
      await client.calls.create({
        from: process.env.TWILIO_PHONE,
        to: phone,
        twiml: `
          <Response>
            <Say voice="alice">
              Emergency alert. Please check the message for live location.
            </Say>
          </Response>
        `,
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: err.message,
    };
  }
};
