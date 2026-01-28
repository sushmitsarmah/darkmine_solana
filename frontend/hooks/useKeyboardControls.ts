
import { useEffect } from 'react';

type Action = 'up' | 'down' | 'left' | 'right';
type ActionCallback = (action: Action) => void;

export const useKeyboardControls = (callback: ActionCallback) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let action: Action | null = null;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          action = 'up';
          break;
        case 'ArrowDown':
        case 's':
          action = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
          action = 'left';
          break;
        case 'ArrowRight':
        case 'd':
          action = 'right';
          break;
        default:
          break;
      }

      if (action) {
        e.preventDefault();
        callback(action);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [callback]);
};
