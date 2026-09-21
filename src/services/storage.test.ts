import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncStorageStore, createMemoryStore } from './storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('createMemoryStore', () => {
  it('stores, reads, and removes values', async () => {
    const store = createMemoryStore();
    expect(await store.getItem('k')).toBeNull();
    await store.setItem('k', 'v');
    expect(await store.getItem('k')).toBe('v');
    await store.removeItem('k');
    expect(await store.getItem('k')).toBeNull();
  });

  it('seeds from initial data', async () => {
    const store = createMemoryStore({ a: '1' });
    expect(await store.getItem('a')).toBe('1');
  });
});

describe('asyncStorageStore', () => {
  it('delegates each operation to AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('value');
    expect(await asyncStorageStore.getItem('k')).toBe('value');
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('k');

    await asyncStorageStore.setItem('k', 'v');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('k', 'v');

    await asyncStorageStore.removeItem('k');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('k');
  });
});
