// src/components/Toast.jsx
import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div 
      className="position-fixed bottom-3 end-3 p-3 rounded shadow-lg"
      style={{
        background: type === 'success' ? '#E50914' : '#333',
        color: 'white',
        zIndex: 99999,
        minWidth: '250px',
        animation: 'slideIn 0.3s ease'
      }}
    >
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <i className={`bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-info-circle-fill'}`}></i>
          <span>{message}</span>
        </div>
        <button 
          onClick={() => {
            setVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="btn btn-sm text-white border-0"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  );
}