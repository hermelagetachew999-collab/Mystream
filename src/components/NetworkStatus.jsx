// src/components/NetworkStatus.jsx
import { useState, useEffect } from 'react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="position-fixed top-0 start-0 w-100 bg-warning text-dark text-center py-2 z-index-9999">
      <i className="bi bi-wifi-off me-2"></i>
      You're offline. Some features may not be available.
    </div>
  );
}