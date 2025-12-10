// src/components/VideoModal.jsx
import { useEffect, useState, useCallback } from "react";
import { getMovieDetails, getMovieVideos, imageUrl } from '../api/tmdb';
import { addToMyList, removeFromMyList, isInMyList } from '../myList';

export default function VideoModal({ movie, onClose }) {
  console.log('VideoModal opened with movie:', movie);
  if (!movie) return null;
  
  const [details, setDetails] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trailer');
  const [similarMovies, setSimilarMovies] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  
  const isInfoOnly = movie?.infoOnly === true;

  // Fetch movie details and similar movies
  const fetchMovieData = useCallback(async () => {
    if (!movie?.id) return;

    setLoading(true);
    try {
      const [movieData, similarData] = await Promise.all([
        getMovieDetails(movie.id),
        fetch(`https://api.themoviedb.org/3/movie/${movie.id}/similar?api_key=${process.env.REACT_APP_TMDB_KEY}&language=en-US&page=1`)
          .then(res => res.json())
          .catch(() => ({ results: [] }))
      ]);

      setDetails(movieData);
      setSimilarMovies(similarData.results?.slice(0, 6) || []);

      // Find trailer
      const trailer = movieData.videos?.results?.find(
        v => v.site === "YouTube" && v.type === "Trailer"
      ) || movieData.videos?.results?.find(v => v.site === "YouTube");

      setTrailerKey(trailer?.key || null);
    } catch (error) {
      console.error("Failed to load movie details:", error);
    } finally {
      setLoading(false);
    }
  }, [movie]);

  useEffect(() => {
    fetchMovieData();
  }, [fetchMovieData]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Skip intro timer
  useEffect(() => {
    if (trailerKey && activeTab === 'trailer' && !isInfoOnly) {
      const timer = setTimeout(() => {
        setShowSkipIntro(true);
      }, 10000);
      
      return () => clearTimeout(timer);
    } else {
      setShowSkipIntro(false);
    }
  }, [trailerKey, activeTab, isInfoOnly]);

  const handleClose = () => {
    onClose();
  };

  const toggleLike = (e) => {
    e.stopPropagation();
    if (isInMyList(movie.id)) {
      removeFromMyList(movie.id);
    } else {
      addToMyList(movie);
    }
    setDetails(prev => ({ ...prev }));
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handlePlayInModal = () => {
    setActiveTab('trailer');
    if (isMuted) {
      setIsMuted(false);
    }
    
    if (trailerKey) {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.src = `https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=1&rel=0&modestbranding=1&fs=1&mute=0`;
      }
    }
  };

  const handleSkipIntro = () => {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.src = `https://www.youtube.com/embed/${trailerKey}?autoplay=1&start=90&controls=1&rel=0&modestbranding=1&fs=1&mute=${isMuted ? '1' : '0'}`;
    }
    setShowSkipIntro(false);
  };

  const handleSimilarMovieClick = (similarMovie) => {
    onClose();
    window.location.reload();
  };

  const isLiked = isInMyList(movie.id);

  const title = details?.title || details?.name || movie.title || movie.name;
  const overview = details?.overview || movie.overview || "No description available.";
  const runtime = details?.runtime;
  const genres = details?.genres || [];
  const releaseDate = details?.release_date || movie.release_date;
  const voteAverage = details?.vote_average || movie.vote_average;

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div
      className="modal-bg"
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.9)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      {/* Main Modal */}
      <div 
        className="modal-body"
        onClick={e => e.stopPropagation()}
        style={{ 
          width: '90%',
          maxWidth: '1200px',
          background: '#141414',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '8px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="close-btn"
          style={{
            top: '15px',
            right: '25px',
            background: 'rgba(0,0,0,0.7)',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            zIndex: 10,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '32px', color: 'white', lineHeight: '1' }}>×</span>
        </button>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            {/* Media Section - NO GAPS */}
            <div style={{ position: 'relative', marginBottom: '0' }}>
              {/* Trailer or Backdrop */}
              <div style={{ 
                 aspectRatio: '16/9', 
                 position: 'relative',
                 margin: '0',
                 padding: '0',
                 border: 'none',
                 display: 'block'
              }}>
                {trailerKey && activeTab === 'trailer' ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', margin: '0', padding: '0' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${trailerKey}?autoplay=${isInfoOnly ? '0' : '1'}&controls=1&rel=0&modestbranding=1&fs=1&mute=${isMuted ? '1' : '0'}`}
                      title="Trailer"
                      allowFullScreen
                      className="w-100 h-100 border-0"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      style={{ backgroundColor: '#000', margin: '-5px 0' }}
                      key={`trailer-${trailerKey}-${isMuted}`}
                    />
                    
                    {showSkipIntro && (
                      <button
                        onClick={handleSkipIntro}
                        className="position-absolute top-3 start-3 btn btn-dark px-4 py-2"
                        style={{ zIndex: 10 }}
                      >
                        Skip Intro
                      </button>
                    )}
                    
                    <button
                      onClick={toggleMute}
                      className="position-absolute top-3 end-3 btn btn-dark rounded-circle"
                      style={{ width: '50px', height: '50px' }}
                    >
                      <i className={`bi ${isMuted ? 'bi-volume-mute-fill' : 'bi-volume-up-fill'} fs-5`}></i>
                    </button>
                  </div>
                ) : (
                  <img
                    src={imageUrl(details?.backdrop_path || movie.backdrop_path || movie.poster_path, 'original')}
                    alt={title}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </div>

              {/* Tab Toggle - NO GAPS */}
              <div className="d-flex">
                <button
                  className={`btn ${activeTab === 'trailer' ? 'btn-netflix' : 'btn-dark'} rounded-0 py-2 flex-grow-1`}
                  onClick={() => setActiveTab('trailer')}
                  disabled={!trailerKey}
                >
                  <i className="bi bi-play-circle me-2"></i> {trailerKey ? 'Trailer' : 'No Trailer'}
                </button>
                <button
                  className={`btn ${activeTab === 'info' ? 'btn-netflix' : 'btn-dark'} rounded-0 py-2 flex-grow-1`}
                  onClick={() => setActiveTab('info')}
                >
                  <i className="bi bi-info-circle me-2"></i> Info
                </button>
              </div>
            </div>

            {/* Content Section - Starts immediately after buttons */}
            <div className="p-4 p-md-5" style={{ paddingTop: '1rem' }}>
              <div className="row">
                <div className="col-lg-8">
                  {/* Title and Actions */}
                  <div className="d-flex align-items-center mb-3 flex-wrap">
                    <h1 className="text-white display-5 fw-bold mb-0 me-4">{title}</h1>
                    <div className="d-flex gap-3">
                      <button
                        onClick={handlePlayInModal}
                        className="btn btn-light btn-lg px-4 d-flex align-items-center gap-2"
                      >
                        <i className="bi bi-play-fill"></i> Play
                      </button>
                      <button
                        onClick={toggleLike}
                        className={`btn btn-lg px-4 d-flex align-items-center gap-2 ${isLiked ? 'btn-danger' : 'btn-secondary'}`}
                      >
                        <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                        {isLiked ? 'Liked' : 'Like'}
                      </button>
                      <div className="d-flex gap-2 ms-3">
                        <button
                          onClick={() => setUserRating('thumbsUp')}
                          className={`btn btn-lg ${userRating === 'thumbsUp' ? 'btn-success' : 'btn-outline-success'}`}
                        >
                          <i className="bi bi-hand-thumbs-up"></i>
                        </button>
                        <button
                          onClick={() => setUserRating('thumbsDown')}
                          className={`btn btn-lg ${userRating === 'thumbsDown' ? 'btn-danger' : 'btn-outline-danger'}`}
                        >
                          <i className="bi bi-hand-thumbs-down"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mb-3">
                    <div className="d-flex flex-wrap gap-3 align-items-center mb-2">
                      <span className="badge bg-success fs-6">
                        {voteAverage ? `${voteAverage.toFixed(1)}/10` : 'N/A'}
                      </span>
                      <span className="text-white">
                        {releaseDate?.slice(0, 4) || 'N/A'}
                      </span>
                      {runtime && (
                        <span className="text-white">
                          {formatRuntime(runtime)}
                        </span>
                      )}
                      {movie.adult && (
                        <span className="badge bg-danger">18+</span>
                      )}
                    </div>

                    <div className="mb-2">
                      {genres.map(genre => (
                        <span key={genre.id} className="badge bg-dark me-2 mb-1">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Overview */}
                  <div className="mb-4">
                    <h4 className="text-white mb-2">Overview</h4>
                    <p className="text-white lead" style={{ lineHeight: '1.6', opacity: '0.9' }}>
                      {overview}
                    </p>
                  </div>
                </div>

                <div className="col-lg-4">
                  {/* Cast */}
                  {details?.credits?.cast?.slice(0, 5).length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-white mb-2">Cast</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {details.credits.cast.slice(0, 5).map(person => (
                          <div key={person.id} className="text-center" style={{ width: '80px' }}>
                            <div className="bg-secondary rounded-circle mb-2 mx-auto" style={{ width: '60px', height: '60px' }}></div>
                            <small className="text-white d-block text-truncate">{person.name}</small>
                            <small className="text-white-50 d-block text-truncate" style={{ fontSize: '0.7rem' }}>
                              {person.character}
                            </small>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Similar Movies */}
                  {similarMovies.length > 0 && (
                    <div>
                      <h5 className="text-white mb-2">More Like This</h5>
                      <div className="row row-cols-3 g-2">
                        {similarMovies.map(similar => (
                          <div 
                            key={similar.id} 
                            className="col"
                            onClick={() => handleSimilarMovieClick(similar)}
                            style={{ cursor: 'pointer' }}
                          >
                            <img
                              src={imageUrl(similar.poster_path, 'w200')}
                              alt={similar.title}
                              className="img-fluid rounded"
                              style={{ height: '100px', objectFit: 'cover', width: '100%' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}