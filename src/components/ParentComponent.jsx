// src/components/ParentComponent.jsx
import { useState } from "react";
import VideoModal from "./VideoModal";
import { imageUrl } from "../api/tmdb";

export default function ParentComponent({ searchResults }) {
  const [selectedMovie, setSelectedMovie] = useState(null);

  function handleMovieClick(movie) {
    setSelectedMovie(movie);
  }

  return (
    <div>
      <div className="search-results">
        {searchResults.map((movie) => (
          <div key={movie.id} onClick={() => handleMovieClick(movie)}>
            <img src={imageUrl(movie.poster_path)} alt={movie.title} />
            <p>{movie.title}</p>
          </div>
        ))}
      </div>

      {selectedMovie && (
        <VideoModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
