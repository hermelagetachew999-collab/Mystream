// src/components/RecentViewsRow.jsx
import Row from './Row.jsx';

export default function RecentViewsRow({ recentViews, onSelectMovie, onClear }) {
  if (recentViews.length === 0) return null;
  
  return (
    <div className="position-relative">
      <div className="d-flex justify-content-between align-items-center px-5 mb-2">
        <h2 className="text-white fs-3 fw-bold">Recently Viewed</h2>
        <button 
          onClick={onClear}
          className="btn btn-sm btn-outline-light"
          title="Clear history"
        >
          <i className="bi bi-trash me-1"></i> Clear
        </button>
      </div>
      <Row 
        title="" // Empty title since we have custom header
        movies={recentViews}
        onSelectMovie={onSelectMovie}
        rowType="recent"
      />
    </div>
  );
}

// Then in Home.jsx, replace the recent views row with:
{recentViews.length > 0 && (
  <RecentViewsRow 
    recentViews={recentViews}
    onSelectMovie={handleSelectMovie}
    onClear={clearRecentViews}
  />
)}