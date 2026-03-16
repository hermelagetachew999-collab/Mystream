// src/config.js
export const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TMDB_KEY) || 
                       (typeof process !== 'undefined' && process?.env?.REACT_APP_TMDB_KEY) || "";
export const BASE_URL = "https://api.themoviedb.org/3";

export const APP_NAME = "Netflix Clone"; // change this to your brand name
export const ACCENT_COLOR = "#E50914";   // change theme color (navbar, highlights)
console.log("TMDB KEY:", API_KEY ? 'Present' : 'Missing');
