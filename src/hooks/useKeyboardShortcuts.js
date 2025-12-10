// src/hooks/useKeyboardShortcuts.js
import { useEffect } from 'react';

export default function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyPress = (e) => {
      // ESC closes modal if open
      if (e.key === 'Escape') {
        const modal = document.querySelector('.modal-bg');
        if (modal) {
          const closeBtn = modal.querySelector('.close-btn');
          if (closeBtn) closeBtn.click();
        }
      }
      
      // Space toggles play/pause in modal
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        const iframe = document.querySelector('iframe');
        if (iframe) {
          // Toggle play/pause (YouTube iframe API would be needed for full control)
          console.log('Space pressed - would toggle play/pause');
        }
      }
      
      // M toggles mute in modal
      if (e.key === 'm' || e.key === 'M') {
        const muteBtn = document.querySelector('button[onClick*="toggleMute"]');
        if (muteBtn) muteBtn.click();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);
}