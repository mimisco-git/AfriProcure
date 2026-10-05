import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

// Bump when a persisted shape changes incompatibly; old keys are then ignored.
const STORAGE_PREFIX = 'afriprocure:v1:';

export const storageKey = (key: string) => `${STORAGE_PREFIX}${key}`;

function readStored<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * useState that survives reloads via localStorage. Storage failures (private mode,
 * quota, blocked site data) degrade silently to in-memory state.
 */
export function usePersistentState<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStored(key, fallback, isValid));
  const isFirstWrite = useRef(true);

  useEffect(() => {
    // Skip writing the value we just read so untouched defaults are never persisted
    if (isFirstWrite.current) {
      isFirstWrite.current = false;
      return;
    }
    try {
      window.localStorage.setItem(storageKey(key), JSON.stringify(value));
    } catch {
      // Ignore quota / privacy-mode errors
    }
  }, [key, value]);

  return [value, setValue];
}

export function clearPersistentState(keys: string[]) {
  for (const key of keys) {
    try {
      window.localStorage.removeItem(storageKey(key));
    } catch {
      // Ignore
    }
  }
}
