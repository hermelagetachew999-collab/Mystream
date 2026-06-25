// src/components/VideoModal.jsx
import { useEffect, useState, useCallback } from "react";
import { getMovieDetails, imageUrl, API_KEY } from '../api/tmdb';
import { addToMyList, removeFromMyList, isInMyList } from '../myList';
import { getArchiveMovieDetails } from '../api/archive';

export default function VideoModal({ movie, onClose }) {
  console.log('VideoModal opened with movie:', movie);
  if (!movie) return null;
  
  const [details, setDetails] = useState(null);
  const [currentMovie, setCurrentMovie] = useState(movie);
  const [trailerKey, setTrailerKey] = useState(null);
  const [archiveVideoUrl, setArchiveVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trailer');
  const [similarMovies, setSimilarMovies] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [userRating, setUserRating] = useState(() => {
    return localStorage.getItem(`rating_${currentMovie?.id || movie?.id}`) || null;
  });
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  
  const isInfoOnly = movie?.infoOnly === true;

  // Fetch movie details and similar movies
  const fetchMovieData = useCallback(async () => {
    if (!currentMovie?.id) return;

    setLoading(true);
    try {
      // Check if this is an Internet Archive movie
      if (currentMovie.isArchive) {
        const archiveData = await getArchiveMovieDetails(currentMovie.id);
        if (archiveData) {
          setDetails({
            title: archiveData.title,
            overview: archiveData.description,
            release_date: archiveData.year,
            poster_path: archiveData.posterUrl,
            backdrop_path: archiveData.posterUrl
          });
          setArchiveVideoUrl(archiveData.videoUrl);
          setTrailerKey(null);
        }
      } else {
        // TMDB movie
        const movieData = await getMovieDetails(currentMovie.id);

        setDetails(movieData);
        
        // Use recommendations instead of similar if available, otherwise similar
        const recs = movieData.recommendations?.results?.length > 0 
          ? movieData.recommendations.results 
          : [];
        setSimilarMovies(recs.slice(0, 6));

        // Find trailer
        const trailer = movieData.videos?.results?.find(
          v => v.site === "YouTube" && v.type === "Trailer"
        ) || movieData.videos?.results?.find(v => v.site === "YouTube");

        setTrailerKey(trailer?.key || null);
      }
    } catch (error) {
      console.error("Failed to load movie details:", error);
    } finally {
      setLoading(false);
    }
  }, [movie]);

  useEffect(() => {
    fetchMovieData();
    // Reset rating when currentMovie changes
    setUserRating(localStorage.getItem(`rating_${currentMovie?.id}`) || null);
  }, [fetchMovieData, currentMovie?.id]);

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
    if (isInMyList(currentMovie.id)) {
      removeFromMyList(currentMovie.id);
    } else {
      addToMyList(currentMovie);
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
    // Instead of reload, we can just update the movie state if we had one
    // But since movie comes from props, we should probably tell the parent or use internal state
    // For now, let's just use internal state for the "active" movie if possible
    // Or just reload but keep the modal open? Re-setting the movie prop is better.
    // However, the parent (Home.jsx) manages selectedMovie.
    // Let's just update the internal state for "currentMovie" and fetch data
    setDetails(null);
    setLoading(true);
    setTrailerKey(null);
    setArchiveVideoUrl(null);
    setCurrentMovie(similarMovie);
  };

  const isLiked = isInMyList(currentMovie.id);

  const title = details?.title || details?.name || currentMovie.title || currentMovie.name;
  const overview = details?.overview || currentMovie.overview || "No description available.";
  const runtime = details?.runtime;
  const genres = details?.genres || [];
  const releaseDate = details?.release_date || currentMovie.release_date;
  const voteAverage = details?.vote_average || currentMovie.vote_average;

  // Extract crew
  const director = details?.credits?.crew?.find(c => c.job === "Director")?.name;
  const writers = details?.credits?.crew?.filter(c => ["Writer", "Screenplay", "Author"].includes(c.job))
    ?.map(w => w.name)
    ?.filter((v, i, a) => a.indexOf(v) === i) // unique
    ?.slice(0, 3);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      const event = new CustomEvent('showToast', {
        detail: { message: 'Link copied to clipboard!', type: 'success' }
      });
      window.dispatchEvent(event);
    });
  };

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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
                {archiveVideoUrl && activeTab === 'trailer' ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', margin: '0', padding: '0' }}>
                    <video
                      src={archiveVideoUrl}
                      controls
                      autoPlay={!isInfoOnly}
                      className="w-100 h-100"
                      style={{ backgroundColor: '#000', objectFit: 'contain' }}
                    />
                  </div>
                ) : trailerKey && activeTab === 'trailer' ? (
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
                    src={details?.poster_path || imageUrl(details?.backdrop_path || currentMovie.backdrop_path || currentMovie.poster_path, 'original')}
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
                  disabled={!trailerKey && !archiveVideoUrl}
                >
                  <i className="bi bi-play-circle me-2"></i> {archiveVideoUrl ? 'Full Movie' : (trailerKey ? 'Trailer' : 'No Video')}
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
                          onClick={() => {
                            const val = userRating === 'thumbsUp' ? null : 'thumbsUp';
                            setUserRating(val);
                            if (val) localStorage.setItem(`rating_${currentMovie.id}`, val);
                            else localStorage.removeItem(`rating_${currentMovie.id}`);
                          }}
                          className={`btn btn-lg ${userRating === 'thumbsUp' ? 'btn-success' : 'btn-outline-success'}`}
                        >
                          <i className="bi bi-hand-thumbs-up"></i>
                        </button>
                        <button
                          onClick={() => {
                            const val = userRating === 'thumbsDown' ? null : 'thumbsDown';
                            setUserRating(val);
                            if (val) localStorage.setItem(`rating_${currentMovie.id}`, val);
                            else localStorage.removeItem(`rating_${currentMovie.id}`);
                          }}
                          className={`btn btn-lg ${userRating === 'thumbsDown' ? 'btn-danger' : 'btn-outline-danger'}`}
                        >
                          <i className="bi bi-hand-thumbs-down"></i>
                        </button>
                        <button
                          onClick={handleShare}
                          className="btn btn-lg btn-outline-light ms-2"
                          title="Share"
                        >
                          <i className="bi bi-share"></i>
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
                      {currentMovie.adult && (
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

                  {/* Overview or Rich Info */}
                  <div className="mb-4">
                    {activeTab === 'trailer' ? (
                      <>
                        <h4 className="text-white mb-2">Overview</h4>
                        <p className="text-white lead" style={{ lineHeight: '1.6', opacity: '0.9' }}>
                          {overview}
                        </p>
                        <div className="mt-3">
                          {director && (
                            <div className="text-white-50 mb-1">
                              <span className="text-white">Director:</span> {director}
                            </div>
                          )}
                          {writers?.length > 0 && (
                            <div className="text-white-50">
                              <span className="text-white">Writers:</span> {writers.join(', ')}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="bg-dark p-4 rounded">
                        <h4 className="text-white mb-4">Detailed Information</h4>
                        <div className="row">
                          <div className="col-md-6">
                            <p className="text-white-50 mb-2">Status: <span className="text-white">{details?.status}</span></p>
                            <p className="text-white-50 mb-2">Original Language: <span className="text-white">{details?.original_language?.toUpperCase()}</span></p>
                            <p className="text-white-50 mb-2">Budget: <span className="text-white">{details?.budget > 0 ? `$${details.budget.toLocaleString()}` : 'N/A'}</span></p>
                          </div>
                          <div className="col-md-6">
                            <p className="text-white-50 mb-2">Revenue: <span className="text-white">{details?.revenue > 0 ? `$${details.revenue.toLocaleString()}` : 'N/A'}</span></p>
                            <p className="text-white-50 mb-2">Popularity: <span className="text-white">{details?.popularity?.toFixed(0)}</span></p>
                            <p className="text-white-50 mb-2">Tagline: <span className="text-white">"{details?.tagline || 'N/A'}"</span></p>
                          </div>
                        </div>
                        {details?.production_companies?.length > 0 && (
                           <div className="mt-3">
                             <p className="text-white-50 mb-1">Production Companies:</p>
                             <div className="d-flex flex-wrap gap-2 mt-2">
                               {details.production_companies.slice(0, 4).map(pc => (
                                 <span key={pc.id} className="badge bg-secondary">{pc.name}</span>
                               ))}
                             </div>
                           </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-lg-4">
                  {/* Cast */}
                  {details?.credits?.cast?.slice(0, 8).length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-white mb-3">Cast</h5>
                      <div className="d-flex flex-wrap gap-3">
                        {details.credits.cast.slice(0, 8).map(person => (
                          <div key={person.id} className="text-center" style={{ width: '80px' }}>
                            <div className="mb-2 mx-auto" style={{ width: '65px', height: '65px' }}>
                               {person.profile_path ? (
                                 <img 
                                   src={imageUrl(person.profile_path, 'w200')} 
                                   alt={person.name}
                                   className="rounded-circle w-100 h-100 object-fit-cover shadow-sm border border-secondary"
                                 />
                               ) : (
                                 <div className="bg-secondary rounded-circle w-100 h-100 d-flex align-items-center justify-content-center">
                                   <i className="bi bi-person-fill text-dark fs-3"></i>
                                 </div>
                               )}
                            </div>
                            <small className="text-white d-block text-truncate fw-bold">{person.name}</small>
                            <small className="text-white-50 d-block text-truncate" style={{ fontSize: '0.65rem' }}>
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