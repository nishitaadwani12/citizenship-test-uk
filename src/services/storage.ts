import AsyncStorage from '@react-native-async-storage/async-storage';

/** Minimal async key/value store. Abstracted so services can be unit-tested
 *  against an in-memory implementation instead of the native AsyncStorage. */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** Production store backed by React Native AsyncStorage. */
export const asyncStorageStore: KeyValueStore = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

/** In-memory store, used by tests and safe fallbacks. */
export function createMemoryStore(initial: Record<string, string> = {}): KeyValueStore {
  const data = new Map<string, string>(Object.entries(initial));
  return {
    getItem: async (key) => (data.has(key) ? (data.get(key) as string) : null),
    setItem: async (key, value) => {
      data.set(key, value);
    },
    removeItem: async (key) => {
      data.delete(key);
    },
  };
}
