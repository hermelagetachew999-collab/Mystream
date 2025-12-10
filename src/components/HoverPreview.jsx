// src/components/HoverPreview.jsx
import { useState, useEffect } from 'react';
import { getMovieVideos } from '../api/tmdb';

export default function HoverPreview({ movie, position }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    if (movie && position) {
      setLoading(true);
      getMovieVideos(movie.id)
        .then(data => {
          if (!mounted) return;
          const trailer = data.results?.find(v => 
            v.site === "YouTube" && v.type === "Trailer"
          );
          if (trailer) setTrailerKey(trailer.key);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }

    return () => { mounted = false; };
  }, [movie]);

  if (!movie || !position) return null;

  return (
    <div 
      className="position-fixed bg-dark rounded-3 shadow-lg overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: '300px',
        height: '169px',
        zIndex: 9999,
        transform: 'translate(-50%, -100%)'
      }}
    >
      {loading ? (
        <div className="w-100 h-100 d-flex align-items-center justify-content-center">
          <div className="spinner-border text-light" style={{ width: '3rem', height: '3rem' }}></div>
        </div>
      ) : trailerKey ? (
        <iframe
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`}
          className="w-100 h-100 border-0"
          title="Preview"
          allow="autoplay"
        />
      ) : (
        <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center">
          <span className="text-white">No preview available</span>
        </div>
      )}
    </div>
  );
}