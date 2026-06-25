// src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import SearchResults from "./SearchResults.jsx";
import { APP_NAME } from "../config";

export default function Navbar({ onSearchQuery, onSelectMovie, onOpenMyList, profile }) {
  const [query, setQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [myListCount, setMyListCount] = useState(0);
  const menuRef = useRef(null);

  // Update My List count
  useEffect(() => {
    const updateCount = () => {
      try {
        const profile = JSON.parse(localStorage.getItem('netflix_profile') || '{}');
        const key = `myList_${profile.ageGroup || 'default'}_${profile.name || 'user'}`;
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        setMyListCount(list.length);
      } catch {
        setMyListCount(0);
      }
    };

    updateCount();
    window.addEventListener('storage', updateCount);
    const interval = setInterval(updateCount, 2000);

    return () => {
      window.removeEventListener('storage', updateCount);
      clearInterval(interval);
    };
  }, []);

  const handleSearch = (e) => {
    const v = e.target.value;
    setQuery(v);
    onSearchQuery?.(v);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar bg-black position-fixed top-0 start-0 end-0 z-3" style={{ height: 'auto', minHeight: '68px' }}>
      <div className="container-fluid d-flex align-items-center pe-0 flex-nowrap">
        <span className="navbar-brand fs-3 fw-bold" style={{ color: 'var(--accent)' }}>
          {APP_NAME}
        </span>

        {/* Hamburger Menu Button - Mobile Only */}
        <button
          className="btn btn-dark d-md-none ms-auto"
          onClick={() => setShowMenu(s => !s)}
          style={{ border: 'none', padding: '8px 12px' }}
        >
          <i className={`bi ${showMenu ? 'bi-x-lg' : 'bi-list'} fs-3`}></i>
        </button>

        {/* Desktop Search - Hidden on Mobile */}
        <div className="ms-3 position-relative flex-grow-1 d-none d-md-block" style={{ maxWidth: '100%' }}>
          <div className="input-group">
            <input
              type="text"
              className="form-control bg-white text-black border-0 rounded-start"
              placeholder="Search..."
              value={query}
              onChange={handleSearch}
              style={{ outline: 'none', height: '40px' }}
            />
            <button className="btn bg-black text-white border-0 rounded-end px-3">
              <i className="bi bi-search"></i>
            </button>
          </div>
          {query && (
            <SearchResults
              query={query}
              onSelectMovie={(movie) => {
                setQuery("");
                onSelectMovie(movie);
              }}
            />
          )}
        </div>

        {/* Avatar + Dropdown - Desktop */}
        <div className="ms-auto ms-md-4 position-relative flex-shrink-0 d-none d-md-block" ref={menuRef}>
          <div
            className="bg-danger rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
            style={{ width: 40, height: 40, cursor: 'pointer' }}
            onClick={() => setShowMenu(s => !s)}
          >
            {profile?.name?.[0]?.toUpperCase() || "U"}
          </div>

          {showMenu && (
            <div
              className="position-absolute end-0 mt-2 bg-dark text-white rounded-3 shadow-lg p-3"
              style={{
                minWidth: 260,
                background: 'rgba(0,0,0,0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                zIndex: 99999,
                top: '100%'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="bg-danger rounded-circle" style={{ width: 40, height: 40 }}></div>
                <div>
                  <div className="fw-bold">{profile?.name || "User"}</div>
                  <small className="text-white-50">{profile?.ageGroup || "adult"}</small>
                </div>
              </div>

              <hr className="border-secondary opacity-25 my-2" />

              {/* My List with Counter */}
              <div
                className="py-2 px-3 rounded hover-bg-gray d-flex justify-content-between"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  onOpenMyList();
                  setShowMenu(false);
                }}
              >
                <span>My List</span>
                {myListCount > 0 && (
                  <span className="badge bg-netflix">{myListCount}</span>
                )}
              </div>

              <div
                className="py-2 px-3 rounded hover-bg-gray"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setShowNotifications(true);
                  setShowMenu(false);
                }}
              >
                Notifications
              </div>

              <hr className="border-secondary opacity-25 my-2" />

              <div
                className="py-2 px-3 rounded hover-bg-gray text-danger"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  localStorage.removeItem("netflix_profile");
                  window.location.reload();
                }}
              >
                Sign out
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 bg-dark"
          style={{
            top: '68px',
            zIndex: 99998,
            padding: '20px',
            minHeight: 'calc(100vh - 68px)'
          }}
          ref={menuRef}
        >
          {/* Mobile Search */}
          <div className="mb-4">
            <div className="input-group">
              <input
                type="text"
                className="form-control bg-white text-black border-0 rounded-start"
                placeholder="Search..."
                value={query}
                onChange={handleSearch}
                style={{ outline: 'none', height: '40px' }}
              />
              <button className="btn bg-black text-white border-0 rounded-end px-3">
                <i className="bi bi-search"></i>
              </button>
            </div>
            {query && (
              <SearchResults
                query={query}
                onSelectMovie={(movie) => {
                  setQuery("");
                  onSelectMovie(movie);
                  setShowMenu(false);
                }}
              />
            )}
          </div>

          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="bg-danger rounded-circle" style={{ width: 50, height: 50 }}></div>
            <div>
              <div className="fw-bold fs-5">{profile?.name || "User"}</div>
              <small className="text-white-50">{profile?.ageGroup || "adult"}</small>
            </div>
          </div>

          <hr className="border-secondary opacity-25 my-3" />

          <div
            className="py-3 px-3 rounded hover-bg-gray d-flex justify-content-between align-items-center"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              onOpenMyList();
              setShowMenu(false);
            }}
          >
            <span className="fs-5">My List</span>
            {myListCount > 0 && (
              <span className="badge bg-netflix">{myListCount}</span>
            )}
          </div>

          <div
            className="py-3 px-3 rounded hover-bg-gray"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setShowNotifications(true);
              setShowMenu(false);
            }}
          >
            <span className="fs-5">Notifications</span>
          </div>

          <hr className="border-secondary opacity-25 my-3" />

          <div
            className="py-3 px-3 rounded hover-bg-gray text-danger"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              localStorage.removeItem("netflix_profile");
              window.location.reload();
            }}
          >
            <span className="fs-5">Sign out</span>
          </div>
        </div>
      )}
    </nav>
  );
}