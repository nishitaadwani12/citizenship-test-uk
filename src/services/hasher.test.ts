import * as Crypto from 'expo-crypto';
import { cryptoHasher, generateSalt } from './hasher';

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(),
  randomUUID: jest.fn(),
}));

describe('cryptoHasher', () => {
  it('hashes salt and password with SHA-256', async () => {
    (Crypto.digestStringAsync as jest.Mock).mockResolvedValue('hashed');
    const result = await cryptoHasher.hash('pw', 'salt');
    expect(result).toBe('hashed');
    expect(Crypto.digestStringAsync).toHaveBeenCalledWith('SHA-256', 'salt:pw');
  });
});

describe('generateSalt', () => {
  it('returns a random uuid', () => {
    (Crypto.randomUUID as jest.Mock).mockReturnValue('uuid-123');
    expect(generateSalt()).toBe('uuid-123');
  });
});
