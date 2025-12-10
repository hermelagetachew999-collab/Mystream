// src/components/Hero.jsx
import { imageUrl } from '../api/tmdb';
import React, { useEffect} from 'react';
function Hero({ featuredMovie, onPlay, onMoreInfo }) {
  const bgUrl = imageUrl(featuredMovie?.backdrop_path || featuredMovie?.poster_path, 'original');
useEffect(() => {
  const handleSpacePress = (e) => {
    if (e.key === ' ' && featuredMovie) {
      e.preventDefault();
      onPlay(featuredMovie);
    }
  };
  
  document.addEventListener('keydown', handleSpacePress);
  return () => document.removeEventListener('keydown', handleSpacePress);
}, [featuredMovie, onPlay]);

  return (
    <div
      className="hero-bg d-flex align-items-end"
      style={{
        backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 20%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.15)), url('${bgUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '150vh',
        paddingBottom: '5rem'
      }}
    >
      <div className="container" style={{ marginBottom: '5rem' }}>
        <h1 className="display-1 mb-3 text-white fw-bold" style={{ 
          textShadow: '2px 2px 10px rgba(0,0,0,0.8)',
          maxWidth: '800px'
        }}>
          {featuredMovie?.title || featuredMovie?.name}
        </h1>
        <p className="fs-4 mb-4 text-white" style={{ 
          maxWidth: '600px',
          textShadow: '1px 1px 5px rgba(0,0,0,0.8)',
          opacity: '0.9'
        }}>
          {featuredMovie?.overview?.length > 200 
            ? featuredMovie.overview.substring(0, 200) + '...' 
            : featuredMovie?.overview}
        </p>

        <div className="d-flex gap-3">
          
<button
  onClick={() => onPlay(featuredMovie)}
  className="btn btn-light btn-lg px-5 d-flex align-items-center gap-2 fw-bold"
  style={{ fontSize: '1.2rem' }}
  title="Press SPACE to play"
>
  <i className="bi bi-play-fill fs-4"></i> Play
</button>
<button
  onClick={() => {
    console.log('More Info clicked for:', featuredMovie?.title);
    onMoreInfo(featuredMovie, 'info-only');
  }}
  className="btn btn-secondary btn-lg px-5 d-flex align-items-center gap-2 fw-bold"
  style={{ 
    fontSize: '1.2rem',
    background: 'rgba(109, 109, 110, 0.7)',
    border: 'none'
  }}
>
  <i className="bi bi-info-circle fs-4"></i> More Info
</button>
        </div>
      </div>
    </div>
  );
}

export default Hero;