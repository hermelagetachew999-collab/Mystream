// src/components/Home.jsx
import { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar.jsx';
import Hero from './Hero.jsx';
import Row from './Row.jsx';
import VideoModal from './VideoModal.jsx';
import SearchResults from './SearchResults.jsx';
import { getTrending, getPopular, getTopRated, fetchTMDB, imageUrl } from '../api/tmdb';
import { getMyList } from '../myList';
import { getFeaturedArchiveMovies } from '../api/archive';

function Home({ profile }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [myList, setMyList] = useState([]);
  const [showMyList, setShowMyList] = useState(false);
  const [loadingHero, setLoadingHero] = useState(true);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [archiveMovies, setArchiveMovies] = useState([]);
  const [loadingRows, setLoadingRows] = useState({
    trending: true,
    popular: true,
    topRated: true,
    archive: true
  });

  // Load My List
  useEffect(() => {
    setMyList(getMyList());
  }, [showMyList]);

  // Hero Loading
  const loadHero = useCallback(async () => {
    setLoadingHero(true);
    try {
      let movies = [];

      if (profile?.ageGroup === 'adult') {
        const endpoints = [
          "/discover/movie?with_genres=28&sort_by=popularity.desc",
          "/discover/movie?with_genres=53&sort_by=popularity.desc",
          "/trending/movie/week"
        ];

        for (const ep of endpoints) {
          try {
            const data = await fetchTMDB(ep);
            const clean = (data.results || []).filter(m => !m.adult && m.backdrop_path);
            if (clean.length > 0) {
              movies = clean;
              break;
            }
          } catch (e) {
            console.error("Hero fetch error:", e);
          }
        }
      }
      else if (profile?.ageGroup === 'kid') {
        const data = await fetchTMDB("/discover/movie?with_genres=16,10751&sort_by=popularity.desc");
        movies = (data.results || []).filter(m => !m.adult && m.backdrop_path);
      }
      else if (profile?.ageGroup === 'elder') {
        const data = await fetchTMDB("/trending/movie/week?include_adult=false");
        movies = (data.results || []).filter(m => !m.genre_ids?.includes(27) && m.backdrop_path);
      }
      else {
        const data = await fetchTMDB("/trending/movie/week");
        movies = (data.results || []).filter(m => m.backdrop_path);
      }

      if (movies.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(5, movies.length));
        setFeaturedMovie(movies[randomIndex]);
      } else {
        setFeaturedMovie({
          title: 'Welcome to Netflix',
          overview: 'Start browsing to discover amazing movies and TV shows.',
          backdrop_path: '/wRxLAw4l17LqiFcPLkobriPTZAw.jpg'
        });
      }
    } catch (error) {
      console.error("Failed to load hero:", error);
      setFeaturedMovie({
        title: 'Something went wrong',
        overview: 'Please try again later.',
        backdrop_path: null
      });
    } finally {
      setLoadingHero(false);
    }
  }, [profile]);

  // Load all rows
  const loadRows = useCallback(async () => {
    try {
      setLoadingRows({ trending: true, popular: true, topRated: true, archive: true });

      const [trendingData, popularData, topRatedData, archiveData] = await Promise.allSettled([
        getTrending(),
        getPopular(),
        getTopRated(),
        getFeaturedArchiveMovies()
      ]);

      if (trendingData.status === 'fulfilled') {
        setTrending(trendingData.value.results || []);
      }
      if (popularData.status === 'fulfilled') {
        setPopular(popularData.value.results || []);
      }
      if (topRatedData.status === 'fulfilled') {
        setTopRated(topRatedData.value.results || []);
      }
      if (archiveData.status === 'fulfilled') {
        setArchiveMovies(archiveData.value || []);
      }
    } catch (error) {
      console.error("Failed to load rows:", error);
    } finally {
      setLoadingRows({ trending: false, popular: false, topRated: false, archive: false });
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadHero();
    loadRows();
  }, [loadHero, loadRows]);

  // Auto-refresh rows every hour
  useEffect(() => {
    const interval = setInterval(() => {
      loadRows();
      console.log('Refreshed content');
    }, 3600000);

    return () => clearInterval(interval);
  }, [loadRows]);

  // Handle movie selection
  const handleSelectMovie = (movie, mode = 'play') => {
    if (!movie || !movie.id) {
      console.error('Invalid movie object:', movie);
      return;
    }

    // Clear search if open
    if (searchQuery) {
      setSearchQuery('');
    }

    // Set the selected movie
    if (mode === 'info-only') {
      setSelectedMovie({
        ...movie,
        infoOnly: true,
        title: movie.title || movie.name,
        backdrop_path: movie.backdrop_path || movie.poster_path
      });
    } else {
      setSelectedMovie({
        ...movie,
        infoOnly: false,
        title: movie.title || movie.name,
        backdrop_path: movie.backdrop_path || movie.poster_path
      });
    }

    // Close My List modal if open
    if (showMyList) {
      setShowMyList(false);
    }
  };

  const handleCloseMyList = () => {
    setShowMyList(false);
    setMyList(getMyList());
  };

  // Row Skeleton Component
  const RowSkeleton = ({ title }) => (
    <div className="text-white my-5 position-relative">
      <h2 className="px-5 mb-4 fs-3 fw-bold">{title}</h2>
      <div className="d-flex gap-3 px-5 py-2 hide-scrollbar">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 placeholder-glow"
            style={{ width: '220px', height: '124px' }}
          >
            <div className="w-100 h-100 bg-secondary rounded" style={{ animationDelay: `${i * 0.1}s` }}></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="home-container">
      <Navbar
        onSearchQuery={setSearchQuery}
        profile={profile}
        onSelectMovie={handleSelectMovie}
        onOpenMyList={() => setShowMyList(true)}
      />

      <div className="hero-section">
        <Hero
          featuredMovie={featuredMovie}
          onPlay={handleSelectMovie}
          onMoreInfo={handleSelectMovie}
          isLoading={loadingHero}
        />

        <div className="rows-section">
          {searchQuery ? (
            <SearchResults query={searchQuery} onSelectMovie={handleSelectMovie} />
          ) : (
            <>
              {loadingRows.trending ? (
                <RowSkeleton title="Trending Now" />
              ) : trending.length > 0 && (
                <Row
                  title="Trending Now"
                  movies={trending}
                  onSelectMovie={handleSelectMovie}
                  ageGroup={profile?.ageGroup}
                  rowType="trending"
                />
              )}

              {loadingRows.popular ? (
                <RowSkeleton title="Popular" />
              ) : popular.length > 0 && (
                <Row
                  title="Popular"
                  movies={popular}
                  onSelectMovie={handleSelectMovie}
                  ageGroup={profile?.ageGroup}
                  rowType="popular"
                />
              )}

              {loadingRows.topRated ? (
                <RowSkeleton title="Top Rated" />
              ) : topRated.length > 0 && (
                <Row
                  title="Top Rated"
                  movies={topRated}
                  onSelectMovie={handleSelectMovie}
                  ageGroup={profile?.ageGroup}
                  rowType="topRated"
                />
              )}

              {loadingRows.archive ? (
                <RowSkeleton title="Free Full Movies" />
              ) : archiveMovies.length > 0 && (
                <Row
                  title="Free Full Movies"
                  movies={archiveMovies}
                  onSelectMovie={handleSelectMovie}
                  ageGroup={profile?.ageGroup}
                  rowType="archive"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* My List Modal */}
      {showMyList && (
        <div
          className="modal-bg"
          onClick={handleCloseMyList}
        >
          <div
            className="modal-body"
            style={{ maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={handleCloseMyList}
              className="close-btn"
              style={{ top: '20px', right: '20px', fontSize: '40px' }}
            >
              ×
            </button>

            <h2 className="text-white text-center mb-5 display-4">My List</h2>

            {myList.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-heart text-white-50" style={{ fontSize: '80px' }}></i>
                <p className="text-white-50 mt-3 fs-4">Your list is empty</p>

              </div>
            ) : (
              <div className="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-4">
                {myList.map(movie => (
                  <div key={movie.id} className="col">
                    <div className="position-relative cursor-pointer"
                      onClick={() => {
                        handleSelectMovie(movie);
                        handleCloseMyList();
                      }}
                    >
                      <img
                        src={imageUrl(movie.poster_path || movie.backdrop_path, 'w300')}
                        alt={movie.title}
                        className="img-fluid rounded shadow hover-zoom"
                        style={{
                          height: '280px',
                          objectFit: 'cover',
                          width: '100%'
                        }}
                      />
                      <div className="position-absolute top-0 end-0 m-2">
                        <i className="bi bi-heart-fill text-danger fs-4"></i>
                      </div>
                      <p className="text-white mt-2 small text-truncate">{movie.title || movie.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedMovie && (
        <VideoModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}

export default Home;