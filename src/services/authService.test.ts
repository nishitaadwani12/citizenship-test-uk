import { AuthError, AuthService, MIN_PASSWORD_LENGTH } from './authService';
import { Hasher } from './hasher';
import { createMemoryStore, KeyValueStore } from './storage';

// Deterministic hasher: hash is just "salt:password".
const fakeHasher: Hasher = {
  hash: async (password, salt) => `${salt}:${password}`,
};

function makeService(store: KeyValueStore = createMemoryStore()): AuthService {
  return new AuthService(store, fakeHasher, () => 'fixed-salt');
}

describe('AuthService.signUp', () => {
  it('creates an account and starts a session', async () => {
    const auth = makeService();
    const user = await auth.signUp('New@Example.com ', 'secret1');
    expect(user).toEqual({ email: 'new@example.com' });
    expect(await auth.getCurrentUser()).toEqual({ email: 'new@example.com' });
  });

  it('rejects an invalid email', async () => {
    const auth = makeService();
    await expect(auth.signUp('not-an-email', 'secret1')).rejects.toBeInstanceOf(AuthError);
  });

  it('rejects a short password', async () => {
    const auth = makeService();
    const short = 'a'.repeat(MIN_PASSWORD_LENGTH - 1);
    await expect(auth.signUp('a@b.com', short)).rejects.toThrow(/at least/);
  });

  it('rejects a duplicate email', async () => {
    const auth = makeService();
    await auth.signUp('a@b.com', 'secret1');
    await expect(auth.signUp('a@b.com', 'secret1')).rejects.toThrow(/already exists/);
  });

  it('uses the default salt generator when none is injected', async () => {
    const auth = new AuthService(createMemoryStore(), fakeHasher);
    await expect(auth.signUp('a@b.com', 'secret1')).resolves.toEqual({ email: 'a@b.com' });
  });
});

describe('AuthService.login', () => {
  it('logs in with correct credentials', async () => {
    const store = createMemoryStore();
    await makeService(store).signUp('a@b.com', 'secret1');
    const user = await makeService(store).login('A@B.com', 'secret1');
    expect(user).toEqual({ email: 'a@b.com' });
  });

  it('rejects an unknown account', async () => {
    await expect(makeService().login('none@b.com', 'secret1')).rejects.toThrow(/No account/);
  });

  it('rejects an incorrect password', async () => {
    const store = createMemoryStore();
    await makeService(store).signUp('a@b.com', 'secret1');
    await expect(makeService(store).login('a@b.com', 'wrongpw')).rejects.toThrow(/Incorrect/);
  });
});

describe('AuthService session', () => {
  it('returns null when nobody is signed in', async () => {
    expect(await makeService().getCurrentUser()).toBeNull();
  });

  it('clears the session on logout', async () => {
    const auth = makeService();
    await auth.signUp('a@b.com', 'secret1');
    await auth.logout();
    expect(await auth.getCurrentUser()).toBeNull();
  });
});
