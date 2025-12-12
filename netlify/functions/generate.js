// netlify/functions/generate.js
// Serverless function for calling Google Gemini (Netlify Functions - Node 18+)
export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const body = JSON.parse(event.body || "{}");
    const prompt = body.prompt?.trim();
    if (!prompt) return { statusCode: 400, body: JSON.stringify({ error: "prompt required" }) };

    const KEY = process.env.GEMINI_API_KEY;
    if (!KEY) return { statusCode: 500, body: JSON.stringify({ error: "server missing GEMINI_API_KEY" }) };

    // Choose model (change to gemini-2.0-pro or others if you prefer)
    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;

    // Minimal request body — you can expand with safety or more options
    const reqBody = {
      temperature: 0.7,
      candidateCount: 1,
      // The "prompt" shape may vary slightly over versions — this is a generic pattern.
      prompt: { text: prompt },
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody),
    });

    const data = await r.json();

    // Safely extract text from the response (handles several possible shapes)
    let text = "";

    // Common pattern: data.candidates[0].content[0].text OR data.candidates[0].output[0].content[0].text
    if (data?.candidates?.[0]) {
      const cand = data.candidates[0];
      if (cand?.content?.[0]?.text) text = cand.content[0].text;
      if (!text && cand?.output?.[0]?.content?.[0]?.text) text = cand.output[0].content[0].text;
      if (!text && typeof cand?.content === "string") text = cand.content;
    }

    // Newer API shapes might put generated text into data.output[0].content[0].text
    if (!text && data?.output?.[0]?.content?.[0]?.text) {
      text = data.output[0].content[0].text;
    }

    // Fallback: stringified data for debugging (keep small)
    if (!text) text = JSON.stringify(data).slice(0, 4000);

    return {
      statusCode: 200,
      body: JSON.stringify({ text, raw: data }),
    };
  } catch (err) {
    console.error("generate error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "internal", details: err.message || err }) };
  }
};
