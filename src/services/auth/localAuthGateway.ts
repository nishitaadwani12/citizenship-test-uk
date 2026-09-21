import { generateSalt, Hasher } from '../hasher';
import { KeyValueStore } from '../storage';
import { AuthGateway } from './gateway';
import { AuthError, AuthUser, PhoneVerification } from './model';

const USERS_KEY = 'auth:users';
const SESSION_KEY = 'auth:session';

interface StoredUser {
  email: string;
  salt: string;
  passwordHash: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

const SOCIAL_UNAVAILABLE =
  'This sign-in method needs Firebase to be configured. See README (Firebase setup).';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function emailUser(email: string): AuthUser {
  return { id: email, email, phoneNumber: null, displayName: null, provider: 'email' };
}

/** On-device email/password authentication with no backend. Social and phone
 *  sign-in are unavailable here and surface a clear message until Firebase is
 *  wired in (see FirebaseAuthGateway). */
export class LocalAuthGateway implements AuthGateway {
  constructor(
    private readonly store: KeyValueStore,
    private readonly hasher: Hasher,
    private readonly saltGenerator: () => string = generateSalt,
  ) {}

  private async readUsers(): Promise<Record<string, StoredUser>> {
    const raw = await this.store.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredUser>) : {};
  }

  private async writeUsers(users: Record<string, StoredUser>): Promise<void> {
    await this.store.setItem(USERS_KEY, JSON.stringify(users));
  }

  async signUpWithEmail(email: string, password: string): Promise<AuthUser> {
    const normalized = normalizeEmail(email);
    if (!EMAIL_PATTERN.test(normalized)) {
      throw new AuthError('Please enter a valid email address.');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new AuthError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
    const users = await this.readUsers();
    if (users[normalized]) {
      throw new AuthError('An account with this email already exists.');
    }
    const salt = this.saltGenerator();
    const passwordHash = await this.hasher.hash(password, salt);
    users[normalized] = { email: normalized, salt, passwordHash };
    await this.writeUsers(users);
    await this.store.setItem(SESSION_KEY, normalized);
    return emailUser(normalized);
  }

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const normalized = normalizeEmail(email);
    const users = await this.readUsers();
    const user = users[normalized];
    if (!user) {
      throw new AuthError('No account found for this email.');
    }
    const passwordHash = await this.hasher.hash(password, user.salt);
    if (passwordHash !== user.passwordHash) {
      throw new AuthError('Incorrect password.');
    }
    await this.store.setItem(SESSION_KEY, normalized);
    return emailUser(normalized);
  }

  async signInWithGoogle(): Promise<AuthUser> {
    throw new AuthError(SOCIAL_UNAVAILABLE);
  }

  async signInWithApple(): Promise<AuthUser> {
    throw new AuthError(SOCIAL_UNAVAILABLE);
  }

  async startPhoneSignIn(_phoneNumber: string): Promise<PhoneVerification> {
    throw new AuthError(SOCIAL_UNAVAILABLE);
  }

  async signOut(): Promise<void> {
    await this.store.removeItem(SESSION_KEY);
  }

  async deleteAccount(): Promise<void> {
    const email = await this.store.getItem(SESSION_KEY);
    if (email) {
      const users = await this.readUsers();
      delete users[email];
      await this.writeUsers(users);
    }
    await this.store.removeItem(SESSION_KEY);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const email = await this.store.getItem(SESSION_KEY);
    return email ? emailUser(email) : null;
  }
}
