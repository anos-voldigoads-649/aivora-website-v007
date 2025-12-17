export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: "Method Not Allowed",
      };
    }

    const body = JSON.parse(event.body || "{}");
    const field = body.field;

    if (!field) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Field is required" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        steps: [
          `Introduction to ${field}`,
          `Fundamentals of ${field}`,
          `Tools used in ${field}`,
          `Hands-on practice`,
          `Intermediate concepts`,
          `Build real projects`,
          `Advanced topics`,
          `Career preparation`,
        ],
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Function crashed",
        message: err.message,
      }),
    };
  }
};
