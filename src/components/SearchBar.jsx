import { useState } from "react";
import { searchMovies, imageUrl } from "../api/tmdb";
import VideoModal from "./VideoModal";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  const type = localStorage.getItem("profileType");

  function filterKids(movies) {
    return movies.filter((m) =>
      m.adult === false &&
      (
        m.genre_ids?.includes(16) ||
        m.genre_ids?.includes(10762) ||
        m.genre_ids?.includes(10751)
      )
    );
  }

  async function search() {
    const data = await searchMovies(query);
    let movies = data.results;

    if (type === "kid") movies = filterKids(movies);

    setResults(movies);
  }

  return (
    <div className="search-box">
      <input
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={search}>Search</button>

      <div className="search-results">
        {results.map((m) => (
          <div key={m.id} className="search-item" onClick={() => setSelected(m)}>
            <img src={imageUrl(m.poster_path)} alt="" />
            <p>{m.title}</p>
          </div>
        ))}
      </div>

      {selected && (
        <VideoModal movie={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
