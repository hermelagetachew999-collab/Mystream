// src/components/SearchResults.jsx
import React, { useEffect, useState } from 'react';
import { searchMovies, imageUrl } from '../api/tmdb';

const getCurrentAgeGroup = () => {
  try {
    const profile = JSON.parse(localStorage.getItem('netflix_profile') || '{}');
    return profile?.ageGroup || 'adult';
  } catch {
    return 'adult';
  }
};

export default function SearchResults({ query, onSelectMovie }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    if (!query?.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    searchMovies(query)
      .then(data => {
        if (!active) return;

        const ageGroup = getCurrentAgeGroup();
        let filtered = data.results || [];

        if (ageGroup === 'kid') {
          filtered = filtered.filter(m =>
            !m.adult &&
            (m.genre_ids?.includes(16) || m.genre_ids?.includes(10751) || m.genre_ids?.includes(10762))
          );
        } else if (ageGroup === 'elder') {
          filtered = filtered.filter(m => !m.genre_ids?.includes(27));
        }

        setResults(filtered);
      })
      .catch(() => {
        if (active) setResults([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [query]);
 
  if (!query?.trim()) return null;

  if (loading) {
    return (
      <div className="position-absolute top-100 start-0 end-0 bg-dark rounded-bottom shadow-lg p-4">
        <div className="text-white text-center">Searching...</div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="position-absolute top-100 start-0 end-0 bg-dark rounded-bottom shadow-lg p-4">
        <div className="text-white-50 text-center">No results found</div>
      </div>
    );
  }

  return (
    <div
      className="position-absolute top-100 start-0 end-0 bg-black border border-secondary rounded-bottom shadow-lg"
      style={{ maxHeight: '60vh', overflowY: 'auto', zIndex: 1000 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="p-2">
        {results.slice(0, 8).map(movie => (
<div
  key={movie.id}
  className="d-flex gap-3 align-items-center p-3 hover-bg-gray cursor-pointer rounded"
  onClick={() => {
    console.log('Search result clicked:', movie.title); // Debug
    if (onSelectMovie) {
      onSelectMovie(movie);
    }
  }}
>
            <img
              src={imageUrl(movie.poster_path || movie.backdrop_path, 'w92')}
              alt={movie.title || movie.name}
              className="rounded"
              style={{ width: 60, height: 90, objectFit: 'cover' }}
            />
            <div>
              <div className="text-white fw-bold">{movie.title || movie.name}</div>
              <small className="text-white-50">
                {movie.release_date?.slice(0, 4) || movie.first_air_date?.slice(0, 4)}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}