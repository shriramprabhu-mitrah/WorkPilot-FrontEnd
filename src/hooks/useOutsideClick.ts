import { RefObject, useEffect } from 'react';

export const useOutsideClick = (
  ref: RefObject<HTMLElement | null>,
  callback: (event?: MouseEvent) => void,
) => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback(e);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, callback]);
};
