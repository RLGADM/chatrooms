import { useState, useEffect } from 'react';

export function useLocalStorageItem<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialValue;
  });

  useEffect(() => {
    if (value !== initialValue) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value, initialValue]);

  const resetValue = () => {
    localStorage.removeItem(key);
    setValue(initialValue);
  };

  return [value, setValue, resetValue] as const;
}
