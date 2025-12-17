export async function handler(event) {
  try {
    const { field, step } = JSON.parse(event.body);

    const explanation = `
### What you will learn
• Core theory of ${step}
• Industry usage
• Best practices

### Why this matters
This step builds strong foundations in ${field} and prepares you for real-world work.

### Practical Tasks
• Watch 2 tutorials  
• Read official documentation  
• Build 1 mini project  

### Resources
• YouTube: https://www.youtube.com/results?search_query=${encodeURIComponent(step)}
• Docs: https://www.google.com/search?q=${encodeURIComponent(step + " documentation")}

### Outcome
You will confidently understand ${step}.
`;

    return {
      statusCode: 200,
      body: JSON.stringify({ explanation }),
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Step details failed" }),
    };
  }
}
