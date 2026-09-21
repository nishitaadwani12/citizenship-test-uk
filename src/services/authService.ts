import { generateSalt, Hasher } from './hasher';
import { KeyValueStore } from './storage';

const USERS_KEY = 'auth:users';
const SESSION_KEY = 'auth:session';

/** A user record as persisted on device. The password is never stored in
 *  plain text — only a salted hash. */
interface StoredUser {
  email: string;
  salt: string;
  passwordHash: string;
}

/** The public view of a signed-in user. */
export interface AuthUser {
  email: string;
}

export class AuthError extends Error {}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** On-device authentication. Swappable for a remote provider (e.g. Firebase)
 *  behind the same method surface. */
export class AuthService {
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

  async signUp(email: string, password: string): Promise<AuthUser> {
    const normalized = normalizeEmail(email);
    if (!EMAIL_PATTERN.test(normalized)) {
      throw new AuthError('Please enter a valid email address.');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new AuthError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
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
    return { email: normalized };
  }

  async login(email: string, password: string): Promise<AuthUser> {
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
    return { email: normalized };
  }

  async logout(): Promise<void> {
    await this.store.removeItem(SESSION_KEY);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const email = await this.store.getItem(SESSION_KEY);
    return email ? { email } : null;
  }
}
