// src/components/Row.jsx
import { useRef, useState, useEffect } from 'react';
import { imageUrl } from '../api/tmdb';
import { addToMyList, removeFromMyList, isInMyList } from '../myList';

function Row({ title, movies, onSelectMovie, ageGroup, rowType }) {
  const [hearts, setHearts] = useState({});
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const scrollRef = useRef(null);
  const [previewMovie, setPreviewMovie] = useState(null);
  const [previewPosition, setPreviewPosition] = useState(null);

  // Filter movies by age group
  const filteredMovies = (() => {
    if (!ageGroup || !movies) return movies || [];

    return movies.filter(movie => {
      // DEBUG: Log Zootopia specifically
      if (movie.title === "Zootopia" || movie.title === "Zootropolis") {
        console.log("ZOOTOPIA FOUND!", {
          title: movie.title,
          genres: movie.genre_ids,
          adult: movie.adult,
          ageGroup: ageGroup
        });
      }

      const isAdult = movie.adult === true;
      const isHorror = movie.genre_ids?.includes(27);
      const isKidsTV = movie.genre_ids?.includes(10762);
      const isAnimation = movie.genre_ids?.includes(16);
      const isFamily = movie.genre_ids?.includes(10751);

      const isKidFocused = isKidsTV || isAnimation || isFamily;

      const isIntense = movie.genre_ids?.includes(28) || // Action
        movie.genre_ids?.includes(53) || // Thriller
        movie.genre_ids?.includes(80) || // Crime
        movie.genre_ids?.includes(10752); // War

      if (ageGroup === 'kid') {
        return !isAdult && !isHorror && !isIntense &&
          (isAnimation || isFamily || isKidsTV);
      }
      else if (ageGroup === 'elder') {
        return !isAdult && !isHorror && !isAnimation && !isFamily && !isKidsTV;
      }
      else if (ageGroup === 'adult') {
        return !isKidsTV;
      }
      return true;
    }).slice(0, 20);
  })();

  // Initialize hearts state
  useEffect(() => {
    const h = {};
    filteredMovies.forEach(m => h[m.id] = isInMyList(m.id));
    setHearts(h);
  }, [filteredMovies]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const cardWidth = 220;
    const gap = 10;
    const scrollAmount = (cardWidth + gap) * 5;

    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const toggleHeart = (e, movie) => {
    e.stopPropagation();
    e.preventDefault();

    if (hearts[movie.id]) {
      removeFromMyList(movie.id);
    } else {
      addToMyList(movie);
    }
    setHearts(prev => ({ ...prev, [movie.id]: !prev[movie.id] }));
  };

  const handleCardClick = (movie, e) => {
    // Don't trigger if clicking on heart button
    if (e.target.closest('.heart-btn') || e.target.closest('.info-btn')) {
      return;
    }
    // Open the movie in modal
    onSelectMovie(movie);
  };

  const handleInfoClick = (e, movie) => {
    e.stopPropagation();
    onSelectMovie(movie, 'info-only');
  };

  const handlePlayClick = (e, movie) => {
    e.stopPropagation();
    onSelectMovie(movie);
  };

  if (!filteredMovies || filteredMovies.length === 0) return null;

  return (
    <div className="text-white my-5 position-relative">
      <h2 className="px-5 mb-4 fs-3 fw-bold">{title}</h2>

      <div className="position-relative">
        {/* Left Arrow */}
        {filteredMovies.length > 5 && (
          <button
            onClick={() => scroll('left')}
            className="position-absolute start-0 top-50 translate-middle-y btn btn-dark btn-lg rounded-circle z-3 shadow arrow-btn"
            style={{
              left: '10px',
              background: 'rgba(20, 20, 20, 0.9)',
              border: '1px solid rgba(255,255,255,0.3)',
              width: '50px',
              height: '50px'
            }}
          >
            <i className="bi bi-chevron-left fs-4"></i>
          </button>
        )}

        {/* Right Arrow */}
        {filteredMovies.length > 5 && (
          <button
            onClick={() => scroll('right')}
            className="position-absolute end-0 top-50 translate-middle-y btn btn-dark btn-lg rounded-circle z-3 shadow arrow-btn"
            style={{
              right: '10px',
              background: 'rgba(20, 20, 20, 0.9)',
              border: '1px solid rgba(255,255,255,0.3)',
              width: '50px',
              height: '50px'
            }}
          >
            <i className="bi bi-chevron-right fs-4"></i>
          </button>
        )}

        {/* Scrollable Row */}
        <div
          ref={scrollRef}
          className="netflix-row hide-scrollbar"
        >
          {filteredMovies.map(movie => (
            <div
              key={movie.id}
              className="netflix-card position-relative"
              onMouseEnter={(e) => {
                setHoveredMovie(movie.id);
                const rect = e.target.getBoundingClientRect();
                setPreviewPosition({ x: rect.left + rect.width / 2, y: rect.top });
                setPreviewMovie(movie);
              }}
              onMouseLeave={() => {
                setHoveredMovie(null);
                setPreviewMovie(null);
                setPreviewPosition(null);
              }}
              onClick={(e) => handleCardClick(movie, e)}
              style={{
                transform: 'scale(1)',
                zIndex: 1,
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
            >
              {/* Poster Image */}
              <img
                src={imageUrl(movie.poster_path || movie.backdrop_path, 'w300')}
                alt={movie.title || movie.name}
                className="w-100 h-100 object-fit-cover"
                style={{
                  transition: 'opacity 0.4s ease'
                }}
                loading="lazy"
              />

              {/* Heart Button */}
              <button
                onClick={(e) => toggleHeart(e, movie)}
                className="position-absolute top-0 end-0 btn btn-dark rounded-circle m-2 shadow-sm heart-btn"
                style={{
                  width: '40px',
                  height: '40px',
                  zIndex: 100,
                  background: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <i className={`bi ${hearts[movie.id] ? 'bi-heart-fill text-danger' : 'bi-heart'} fs-5`}></i>
              </button>

              {/* Bottom Info Overlay */}
              <div
                className="position-absolute bottom-0 start-0 w-100 p-3"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                  zIndex: 3
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="d-flex gap-2 align-items-center mb-1">
                      <span className="badge bg-secondary">
                        {movie.vote_average?.toFixed(1) || 'N/A'}
                      </span>

                      {/* Trending Badge */}
                      {movie.popularity > 1000 && (
                        <span className="badge bg-warning text-dark">
                          <i className="bi bi-fire me-1"></i> Trending
                        </span>
                      )}

                      {movie.adult && <span className="badge bg-danger">18+</span>}
                    </div>
                    <h6 className="text-white fw-bold mb-0 text-truncate">
                      {movie.title || movie.name}
                    </h6>
                    <small className="text-white-50">
                      {movie.release_date?.slice(0, 4) || movie.first_air_date?.slice(0, 4) || 'N/A'}
                    </small>
                  </div>

                  {/* Info Button */}
                  <button
                    className="btn btn-sm btn-dark rounded-circle info-btn"
                    onClick={(e) => handleInfoClick(e, movie)}
                    style={{ width: '32px', height: '32px' }}
                  >
                    <i className="bi bi-info"></i>
                  </button>
                </div>
              </div>

              {/* Play button overlay on hover */}
              {hoveredMovie === movie.id && (
                <div className="position-absolute top-50 start-50 translate-middle z-4">
                  <button
                    onClick={(e) => handlePlayClick(e, movie)}
                    className="btn btn-light rounded-circle shadow-lg d-flex align-items-center justify-content-center play-btn"
                    style={{
                      width: '60px',
                      height: '60px',
                      background: 'white'
                    }}
                  >
                    <i className="bi bi-play-fill text-dark fs-3"></i>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Row;