// src/api/tmdb.js
export const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TMDB_KEY) || 
                       (typeof process !== 'undefined' && process?.env?.REACT_APP_TMDB_KEY) || "";
const BASE_URL = "https://api.themoviedb.org/3";
const getCurrentAgeGroup = () => {
  try {
    const profile = JSON.parse(localStorage.getItem('netflix_profile') || '{}');
    return profile?.ageGroup || 'adult';
  } catch {
    return 'adult';
  }
};
// Generic fetch helper
export const fetchTMDB = async (endpoint) => {
  if (!API_KEY) {
    console.error("TMDB API key is missing! Check your .env file.");
    return { results: [] };
  }
  
  // Check if endpoint already has query params
  const url = endpoint.includes("?")
    ? `${BASE_URL}${endpoint}&api_key=${API_KEY}&language=en-US`
    : `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status}`);
  return res.json();
};


// Movie lists
export const getTrending = () => {
  const ageGroup = getCurrentAgeGroup();
  const endpoint = ageGroup === 'elder'
    ? "/trending/movie/week?with_adult=false"
    : "/trending/movie/week";
  return fetchTMDB(endpoint);
};

export const getPopular = () => {
  const ageGroup = getCurrentAgeGroup();
  const endpoint = ageGroup === 'elder'
    ? "/movie/popular?with_adult=false"
    : "/movie/popular";
  return fetchTMDB(endpoint);
};

export const getTopRated = () => {
  const ageGroup = getCurrentAgeGroup();
  const endpoint = ageGroup === 'elder'
    ? "/movie/top_rated?with_adult=false"
    : "/movie/top_rated";
  return fetchTMDB(endpoint);
};
// Movie search
export async function searchMovies(query) {
  if (!query?.trim()) return { results: [] };

  const ageGroup = getCurrentAgeGroup();
  const adultParam = ageGroup === 'elder' ? '&include_adult=false' : '';

  const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}${adultParam}`;
  const res = await fetch(url);
  if (!res.ok) return { results: [] };
  return res.json();
}

// Movie details
export const getMovieDetails = (id) =>
  fetchTMDB(`/movie/${id}?append_to_response=videos,credits,recommendations`);
export const getMovieVideos = (id) => fetchTMDB(`/movie/${id}/videos`);

// Image URL helper
export const imageUrl = (path, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
