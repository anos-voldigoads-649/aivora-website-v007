export const handler = async (event) => {
  // --- CORS preflight support ---
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
      body: "OK",
    };
  }

  try {
    const { country = "us", category = "technology", pageSize = "10" } = event.queryStringParameters || {};
    
    // Use env var or fallback to known working key (preventing downtime if env var is missing)
    const apiKey = process.env.VITE_NEWS_API_KEY || "1b4cabe237c2410dafa7ff09db1343f6";

    const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=${pageSize}&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "error") {
       // Pass through News API errors
       return {
        statusCode: 400, // or 500
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: data.message }),
       };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error("News Function Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Internal Server Error: " + error.message }),
    };
  }
};
