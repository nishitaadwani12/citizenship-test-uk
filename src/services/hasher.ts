import * as Crypto from 'expo-crypto';

/** Hashes a password with a salt. Abstracted so auth logic can be tested with
 *  a deterministic fake instead of the native crypto module. */
export interface Hasher {
  hash(password: string, salt: string): Promise<string>;
}

/** Production hasher using SHA-256 from expo-crypto. */
export const cryptoHasher: Hasher = {
  hash: (password, salt) =>
    Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${salt}:${password}`,
    ),
};

/** Generates a random salt string. */
export function generateSalt(): string {
  return Crypto.randomUUID();
}
