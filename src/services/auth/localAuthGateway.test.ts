import { Hasher } from '../hasher';
import { createMemoryStore, KeyValueStore } from '../storage';
import { LocalAuthGateway, MIN_PASSWORD_LENGTH } from './localAuthGateway';
import { AuthError } from './model';

const fakeHasher: Hasher = {
  hash: async (password, salt) => `${salt}:${password}`,
};

function make(store: KeyValueStore = createMemoryStore()): LocalAuthGateway {
  return new LocalAuthGateway(store, fakeHasher, () => 'fixed-salt');
}

describe('LocalAuthGateway email', () => {
  it('signs up and starts a session with a normalised email user', async () => {
    const auth = make();
    const user = await auth.signUpWithEmail('New@Example.com ', 'secret1');
    expect(user).toEqual({
      id: 'new@example.com',
      email: 'new@example.com',
      phoneNumber: null,
      displayName: null,
      provider: 'email',
    });
    expect(await auth.getCurrentUser()).toEqual(user);
  });

  it('rejects an invalid email, short password, and duplicate account', async () => {
    const auth = make();
    await expect(auth.signUpWithEmail('bad', 'secret1')).rejects.toBeInstanceOf(AuthError);
    await expect(
      auth.signUpWithEmail('a@b.com', 'a'.repeat(MIN_PASSWORD_LENGTH - 1)),
    ).rejects.toThrow(/at least/);
    await auth.signUpWithEmail('a@b.com', 'secret1');
    await expect(auth.signUpWithEmail('a@b.com', 'secret1')).rejects.toThrow(/already exists/);
  });

  it('uses the default salt generator when none is injected', async () => {
    const auth = new LocalAuthGateway(createMemoryStore(), fakeHasher);
    await expect(auth.signUpWithEmail('a@b.com', 'secret1')).resolves.toMatchObject({
      email: 'a@b.com',
    });
  });

  it('logs in with correct credentials and rejects bad ones', async () => {
    const store = createMemoryStore();
    await make(store).signUpWithEmail('a@b.com', 'secret1');
    await expect(make(store).signInWithEmail('A@B.com', 'secret1')).resolves.toMatchObject({
      email: 'a@b.com',
    });
    await expect(make(store).signInWithEmail('none@b.com', 'secret1')).rejects.toThrow(/No account/);
    await expect(make(store).signInWithEmail('a@b.com', 'wrong1')).rejects.toThrow(/Incorrect/);
  });

  it('returns null and clears the session on logout', async () => {
    const auth = make();
    expect(await auth.getCurrentUser()).toBeNull();
    await auth.signUpWithEmail('a@b.com', 'secret1');
    await auth.signOut();
    expect(await auth.getCurrentUser()).toBeNull();
  });

  it('deletes the signed-in account so it can no longer log in', async () => {
    const store = createMemoryStore();
    await make(store).signUpWithEmail('a@b.com', 'secret1');
    const auth = make(store);
    await auth.getCurrentUser(); // session exists from sign-up
    await make(store).deleteAccount();
    expect(await make(store).getCurrentUser()).toBeNull();
    await expect(make(store).signInWithEmail('a@b.com', 'secret1')).rejects.toThrow(/No account/);
  });

  it('deleting with no active session is a no-op', async () => {
    const auth = make();
    await auth.deleteAccount();
    expect(await auth.getCurrentUser()).toBeNull();
  });
});

describe('LocalAuthGateway social/phone', () => {
  it('reports that Google, Apple and phone need Firebase', async () => {
    const auth = make();
    await expect(auth.signInWithGoogle()).rejects.toThrow(/Firebase/);
    await expect(auth.signInWithApple()).rejects.toThrow(/Firebase/);
    await expect(auth.startPhoneSignIn('+447700900123')).rejects.toThrow(/Firebase/);
  });
});
