'use client';

import { useEffect } from 'react';

interface KeyCombo { key: string; ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean }

export function useKeyboard(combo: KeyCombo, handler: () => void, deps: unknown[] = []) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const matchKey = e.key.toLowerCase() === combo.key.toLowerCase();
      const matchCtrl = combo.ctrl ? e.ctrlKey : !e.ctrlKey;
      const matchMeta = combo.meta ? e.metaKey : !e.metaKey;
      const matchShift = combo.shift ? e.shiftKey : !e.shiftKey;
      const matchAlt = combo.alt ? e.altKey : !e.altKey;

      if (matchKey && matchCtrl && matchMeta && matchShift && matchAlt) {
        e.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', listener);
    return () => { window.removeEventListener('keydown', listener); };
  }, [combo, handler, deps]);
}
