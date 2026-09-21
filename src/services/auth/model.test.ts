import { AuthError, AuthUser, displayIdentity } from './model';

function user(partial: Partial<AuthUser>): AuthUser {
  return {
    id: 'id',
    email: null,
    phoneNumber: null,
    displayName: null,
    provider: 'email',
    ...partial,
  };
}

describe('displayIdentity', () => {
  it('returns a fallback for no user', () => {
    expect(displayIdentity(null)).toBe('there');
  });

  it('prefers the display name', () => {
    expect(displayIdentity(user({ displayName: 'Alex', email: 'a@b.com' }))).toBe('Alex');
  });

  it('falls back to email then phone', () => {
    expect(displayIdentity(user({ email: 'a@b.com' }))).toBe('a@b.com');
    expect(displayIdentity(user({ phoneNumber: '+44123' }))).toBe('+44123');
  });

  it('falls back to a generic label when nothing is set', () => {
    expect(displayIdentity(user({}))).toBe('there');
  });
});

describe('AuthError', () => {
  it('is an Error subclass carrying the message', () => {
    const err = new AuthError('nope');
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('nope');
  });
});
