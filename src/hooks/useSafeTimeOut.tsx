// hooks/useSafeTimeout.ts
import { useEffect, useRef } from 'react';

export function useSafeTimeout() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setSafeTimeout = (callback: () => void, delay: number) => {
    clearSafeTimeout();
    timeoutRef.current = setTimeout(callback, delay);
  };

  const clearSafeTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearSafeTimeout(); // Limpieza al desmontar
    };
  }, []);

  return { setSafeTimeout, clearSafeTimeout,timeoutRef };
}