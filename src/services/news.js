// src/services/news.js
import axios from "axios";

// Using valid NewsAPI.org key from user
const API_KEY = "1b4cabe237c2410dafa7ff09db1343f6";

export async function getLiveNews() {
  try {
    // NewsAPI endpoint for technology news
    const url = `https://newsapi.org/v2/top-headlines`;
    const res = await axios.get(url, {
      params: {
        country: "us",
        category: "technology",
        apiKey: API_KEY,
        pageSize: 10,
      },
    });

    return res.data.articles.map(article => ({
      title: article.title,
      description: article.description || "No description available.",
      url: article.url,
      image: article.urlToImage || "",
    }));

  } catch (error) {
    console.error("News API Error:", error.message);
    return getFallbackNews(error.message);
  }
}

function getFallbackNews(errorMsg = "") {
  // Return demo data on failure
  const news = [
    {
      title: "Science: New Exoplanet Discovered (Demo)",
      description: "Astronomers have found a potentially habitable planet in a nearby star system.",
      url: "#",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Tech: Quantum Computing Leap (Demo)",
      description: "Researchers achieve new stability milestone in qubits.",
      url: "#",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80"
    }
  ];

  if (errorMsg) {
    news.unshift({
      title: "News Error (Showing Demo)",
      description: `Could not fetch live news: ${errorMsg}`,
      url: "#",
      image: "https://via.placeholder.com/300x200?text=Error"
    });
  }
  
  return news;
}
