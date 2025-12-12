// src/services/news.js
import axios from "axios";

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CX = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;   // You must create free custom search engine

export async function getLiveNews() {
  try {
    const url = `https://www.googleapis.com/customsearch/v1`;
    const res = await axios.get(url, {
      params: {
        key: GOOGLE_KEY,
        cx: CX,        // Custom search engine ID
        q: "latest technology news",
        num: 10,
        sort: "date",
      },
    });

    return res.data.items.map(item => ({
      title: item.title,
      description: item.snippet,
      url: item.link,
      image: item.pagemap?.cse_thumbnail?.[0]?.src || "",
    }));
  } catch (error) {
    console.error("Google News Error:", error.message);
    return getFallbackNews(error.message);
  }
}

function getFallbackNews(errorMsg = "") {
  const news = [
    {
      title: "Science: New Exoplanet Discovered",
      description: "Astronomers have found a potentially habitable planet in a nearby star system.",
      url: "#",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Tech: Quantum Computing Leap",
      description: "Researchers achieve new stability milestone in qubits.",
      url: "#",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80"
    }
  ];

  if (errorMsg) {
    news.unshift({
      title: "News API Error (Check Keys)",
      description: `Could not fetch real news: ${errorMsg}. Showing demo data instead.`,
      url: "#",
      image: "https://via.placeholder.com/300x200?text=API+Error"
    });
  }
  
  return news;
}
