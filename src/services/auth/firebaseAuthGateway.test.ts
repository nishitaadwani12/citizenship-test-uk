import { FirebaseAuthDeps, FirebaseAuthGateway, RawAuthUser } from './firebaseAuthGateway';
import { AuthError } from './model';

function raw(email: string | null, uid = 'uid', phoneNumber: string | null = null): RawAuthUser {
  return { uid, email, phoneNumber, displayName: null };
}

function makeDeps(overrides: Partial<FirebaseAuthDeps> = {}): FirebaseAuthDeps {
  return {
    signUpEmail: jest.fn(async (email: string) => raw(email)),
    signInEmail: jest.fn(async (email: string) => raw(email)),
    signInWithGoogle: jest.fn(async () => raw('g@x.com', 'g-uid')),
    signInWithApple: jest.fn(async () => raw('a@x.com', 'a-uid')),
    startPhone: jest.fn(async () => ({
      verificationId: 'vid',
      confirm: jest.fn(async () => raw(null, 'p-uid', '+447700900123')),
    })),
    signOut: jest.fn(async () => undefined),
    deleteAccount: jest.fn(async () => undefined),
    getCurrentUser: jest.fn(async () => null),
    ...overrides,
  };
}

describe('FirebaseAuthGateway', () => {
  it('signs up and in with email, lowercasing the address', async () => {
    const deps = makeDeps();
    const gateway = new FirebaseAuthGateway(deps);
    expect(await gateway.signUpWithEmail(' A@B.com ', 'pw')).toMatchObject({
      email: 'a@b.com',
      provider: 'email',
    });
    expect(deps.signUpEmail).toHaveBeenCalledWith('a@b.com', 'pw');
    expect(await gateway.signInWithEmail('A@B.com', 'pw')).toMatchObject({ provider: 'email' });
  });

  it('signs in with Google and Apple', async () => {
    const gateway = new FirebaseAuthGateway(makeDeps());
    expect(await gateway.signInWithGoogle()).toMatchObject({ provider: 'google' });
    expect(await gateway.signInWithApple()).toMatchObject({ provider: 'apple' });
  });

  it('runs the phone flow and returns a phone user', async () => {
    const gateway = new FirebaseAuthGateway(makeDeps());
    const verification = await gateway.startPhoneSignIn('+44 7700 900123');
    expect(verification.verificationId).toBe('vid');
    expect(await verification.confirm('123456')).toMatchObject({
      provider: 'phone',
      phoneNumber: '+447700900123',
    });
  });

  it('rejects an invalid phone number before calling the backend', async () => {
    const deps = makeDeps();
    const gateway = new FirebaseAuthGateway(deps);
    await expect(gateway.startPhoneSignIn('0770')).rejects.toThrow(/valid phone number/);
    expect(deps.startPhone).not.toHaveBeenCalled();
  });

  it('wraps a raw backend failure in a friendly AuthError', async () => {
    const gateway = new FirebaseAuthGateway(
      makeDeps({ signInEmail: jest.fn().mockRejectedValue(new Error('network')) }),
    );
    await expect(gateway.signInWithEmail('a@b.com', 'pw')).rejects.toThrow(/Could not sign you in/);
  });

  it('passes through an AuthError unchanged', async () => {
    const gateway = new FirebaseAuthGateway(
      makeDeps({ signInWithGoogle: jest.fn().mockRejectedValue(new AuthError('custom message')) }),
    );
    await expect(gateway.signInWithGoogle()).rejects.toThrow('custom message');
  });

  it('maps a failed code confirmation to a friendly error', async () => {
    const gateway = new FirebaseAuthGateway(
      makeDeps({
        startPhone: jest.fn(async () => ({
          verificationId: 'vid',
          confirm: jest.fn().mockRejectedValue(new Error('bad code')),
        })),
      }),
    );
    const verification = await gateway.startPhoneSignIn('+447700900123');
    await expect(verification.confirm('000000')).rejects.toThrow(/code was not correct/);
  });

  it('signs out and reports the current user', async () => {
    const deps = makeDeps({
      getCurrentUser: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(raw('c@x.com'))
        .mockResolvedValueOnce(raw(null, 'p-uid', '+447700900123')),
    });
    const gateway = new FirebaseAuthGateway(deps);
    expect(await gateway.getCurrentUser()).toBeNull();
    expect(await gateway.getCurrentUser()).toMatchObject({ provider: 'email' });
    expect(await gateway.getCurrentUser()).toMatchObject({ provider: 'phone' });
    await gateway.signOut();
    expect(deps.signOut).toHaveBeenCalled();
  });

  it('deletes the account, mapping failures to a friendly error', async () => {
    const deps = makeDeps();
    const gateway = new FirebaseAuthGateway(deps);
    await gateway.deleteAccount();
    expect(deps.deleteAccount).toHaveBeenCalled();

    const failing = new FirebaseAuthGateway(
      makeDeps({ deleteAccount: jest.fn().mockRejectedValue(new Error('x')) }),
    );
    await expect(failing.deleteAccount()).rejects.toThrow(/Could not delete your account/);
  });
});
