import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShow(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`position-fixed bottom-3 start-3 p-3 rounded shadow-lg ${
      isOnline ? 'bg-success' : 'bg-warning text-dark'
    }`} style={{ zIndex: 9999 }}>
      <i className={`bi ${isOnline ? 'bi-wifi' : 'bi-wifi-off'} me-2`}></i>
      {isOnline ? 'Back online!' : 'You are offline. Limited functionality.'}
    </div>
  );
}