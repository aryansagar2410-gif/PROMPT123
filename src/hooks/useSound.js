import { useState, useEffect } from 'react';
import { sounds } from '../audio/soundEffects';

export function useSound() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Check local storage preference
    const saved = localStorage.getItem('inbox_dungeon_muted');
    if (saved !== null) {
      const val = saved === 'true';
      setIsMuted(val);
      sounds.setMuted(val);
    }
  }, []);

  const toggleSound = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
    localStorage.setItem('inbox_dungeon_muted', String(next));
    if (!next) {
      sounds.playMysticChime();
    }
  };

  return {
    isMuted,
    toggleSound,
    sounds,
  };
}

