// src/components/HelpModal.jsx
import { useState } from 'react';

export default function HelpModal() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      {/* Help Button in Navbar - ADD THIS WHERE YOU WANT */}
      <button 
        className="btn btn-outline-light ms-3"
        onClick={() => setShowHelp(true)}
        style={{ fontSize: '0.8rem' }}
      >
        <i className="bi bi-question-circle me-1"></i> Help
      </button>

      {/* Help Modal */}
      {showHelp && (
        <div 
          className="position-fixed top-0 left-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            zIndex: 99999,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(10px)'
          }}
          onClick={() => setShowHelp(false)}
        >
          <div 
            className="bg-dark rounded-4 p-5 shadow-lg"
            style={{ maxWidth: '500px', width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="text-white mb-0">Keyboard Shortcuts</h2>
              <button 
                onClick={() => setShowHelp(false)}
                className="btn btn-dark rounded-circle"
                style={{ width: '40px', height: '40px' }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className="text-white">
              <div className="mb-3">
                <kbd className="bg-netflix me-2">ESC</kbd>
                <span>Close modal</span>
              </div>
              <div className="mb-3">
                <kbd className="bg-netflix me-2">SPACE</kbd>
                <span>Play/Pause video</span>
              </div>
              <div className="mb-3">
                <kbd className="bg-netflix me-2">M</kbd>
                <span>Mute/Unmute</span>
              </div>
              <div className="mb-3">
                <kbd className="bg-netflix me-2">← →</kbd>
                <span>Navigate rows</span>
              </div>
              <div className="mt-4 pt-3 border-top border-secondary">
                <small className="text-white-50">
                  Hover over movie cards to see trailers
                </small>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}