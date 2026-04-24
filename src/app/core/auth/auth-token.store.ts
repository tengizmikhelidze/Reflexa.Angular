import { Injectable, inject, signal } from '@angular/core';
import { SafeUser } from '../models/auth.models';
import { AuthSessionStore } from './auth-session.store';
/**
 * Aggregates the session token state (delegated to AuthSessionStore)
 * with the resolved user profile. Consumed by AuthStore and guards.
 */
@Injectable({ providedIn: 'root' })
export class AuthTokenStore {
  private readonly session = inject(AuthSessionStore);
  private readonly _user = signal<SafeUser | null>(null);
  // ── Delegated from AuthSessionStore ───────────────────────────────────────
  readonly accessToken = this.session.accessToken;
  readonly refreshToken = this.session.refreshToken;
  readonly isAuthenticated = this.session.isAuthenticated;
  // ── User profile ──────────────────────────────────────────────────────────
  readonly user = this._user.asReadonly();
  // ── Mutations ─────────────────────────────────────────────────────────────
  /** Set both tokens (e.g. after login or token refresh). */
  setTokens(accessToken: string, refreshToken: string): void {
    this.session.setTokens({ accessToken, refreshToken });
  }
  /** Update only the access token. */
  setAccessToken(token: string): void {
    this.session.setAccessToken(token);
  }
  /** Store the resolved user profile. */
  setUser(user: SafeUser): void {
    this._user.set(user);
  }
  /** Clear all session and user state. */
  clear(): void {
    this.session.clear();
    this._user.set(null);
  }
}
