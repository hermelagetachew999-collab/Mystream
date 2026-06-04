// src/components/RowSkeleton.jsx
export default function RowSkeleton({ title }) {
  return (
    <div className="text-white my-5 position-relative">
      <h2 className="px-5 mb-4 fs-3 fw-bold">{title}</h2>
      <div className="position-relative">
        <div className="netflix-row hide-scrollbar">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="netflix-card position-relative placeholder-glow"
              style={{ 
                minWidth: '200px', 
                height: '112px',
                background: 'linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%)',
                backgroundSize: '200% 100%',
                animation: `shimmer 1.5s infinite ${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}