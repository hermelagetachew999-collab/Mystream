// src/components/AutoPlayNext.jsx
import { useState, useEffect } from 'react';

export default function AutoPlayNext({ currentMovie, onNext }) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown <= 0) {
      onNext();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onNext]);

  return (
    <div className="position-fixed bottom-5 end-5 bg-dark rounded-3 p-3 shadow-lg">
      <div className="text-white text-center">
        <div className="fs-4 mb-1">Next episode starts in</div>
        <div className="display-4 fw-bold">{countdown}</div>
        <div className="d-flex gap-2 mt-3">
          <button 
            onClick={onNext}
            className="btn btn-netflix px-4"
          >
            Play Now
          </button>
          <button 
            onClick={() => setCountdown(999)} // Cancel
            className="btn btn-outline-light px-4"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}