import { useEffect } from 'react';

interface KeyboardShortcuts {
  onNewEvent?: () => void;
  onEscape?: () => void;
  onToday?: () => void;
  onNextWeek?: () => void;
  onPrevWeek?: () => void;
  onSearch?: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = 
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA';

      if (isInputFocused && e.key !== 'Escape') {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        shortcuts.onEscape?.();
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            shortcuts.onNewEvent?.();
            break;
          case 'k':
            e.preventDefault();
            shortcuts.onSearch?.();
            break;
        }
      }

      if (!isInputFocused) {
        switch (e.key.toLowerCase()) {
          case 't':
            shortcuts.onToday?.();
            break;
          case 'arrowright':
            shortcuts.onNextWeek?.();
            break;
          case 'arrowleft':
            shortcuts.onPrevWeek?.();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
