// src/utils/gifApi.js
const TENOR_API_KEY = "AIzaSyAmheJsU5I7uaTFn0DOoVUklS__jxef0Fc"; 

export async function searchGifs(query, limit = 12) {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=${limit}`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("GIF API error:", error);
    return [];
  }
}
