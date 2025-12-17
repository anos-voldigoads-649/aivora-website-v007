// src/services/weather.js
import axios from "axios";

// Open-Meteo Geocoding
async function getCoordinates(city) {
  try {
    const url = "https://geocoding-api.open-meteo.com/v1/search";
    const res = await axios.get(url, {
      params: { name: city, count: 1, language: "en", format: "json" }
    });
    
    if (!res.data.results || res.data.results.length === 0) return null;
    return res.data.results[0]; // { latitude, longitude, name, country }
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
}

// Open-Meteo Weather
export async function getWeather(city = "Kolhapur") {
  try {
    const loc = await getCoordinates(city);
    if (!loc) {
       console.warn("Geocode failed, using fallback.");
       return getFallbackWeather(city);
    }

    const weatherUrl = "https://api.open-meteo.com/v1/forecast";
    const res = await axios.get(weatherUrl, {
      params: {
        latitude: loc.latitude,
        longitude: loc.longitude,
        current_weather: true,
      }
    });

    const current = res.data.current_weather;

    return {
      temp: current.temperature,
      description: getWeatherDescription(current.weathercode),
      humidity: "N/A", // Open-Meteo basic free tier doesn't send humidity in current_weather easily without extra params
      wind: `${current.windspeed} km/h`,
      city: loc.name,
    };
  } catch (err) {
    console.error("Weather error:", err);
    return getFallbackWeather(city);
  }
}

// WMO Weather interpretation codes (https://open-meteo.com/en/docs)
function getWeatherDescription(code) {
  const codes = {
    0: "Clear sky",
    1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    80: "Slight showers", 81: "Moderate showers", 82: "Violent showers",
    95: "Thunderstorm", 96: "Thunderstorm + hail"
  };
  return codes[code] || "Variable";
}

function getFallbackWeather(city) {
  return {
    temp: 25,
    description: "Cloudy (Demo)",
    humidity: "65%",
    wind: "12 km/h",
    city: city + " (Demo Mode)",
  };
}
