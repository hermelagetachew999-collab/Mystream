// src/config.js
export const API_KEY = import.meta.env?.VITE_TMDB_KEY || process?.env?.REACT_APP_TMDB_KEY || "";
export const BASE_URL = "https://api.themoviedb.org/3";

export const APP_NAME = "Netflix Clone"; // change this to your brand name
export const ACCENT_COLOR = "#E50914";   // change theme color (navbar, highlights)
console.log("TMDB KEY:", API_KEY ? 'Present' : 'Missing');
