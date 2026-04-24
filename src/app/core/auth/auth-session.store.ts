import { computed, Injectable, signal } from '@angular/core';

export interface TokenPairInput {
  accessToken: string;
  refreshToken: string;
}

/**
 * Owns the raw session state: tokens and refresh-in-progress flag.
 * Nothing else — no user, no UI state.
 * Consumed by AuthTokenStore (for backward compat) and the auth interceptor.
 */
@Injectable({ providedIn: 'root' })
export class AuthSessionStore {
  private readonly _accessToken = signal<string | null>(null);
  private readonly _refreshToken = signal<string | null>(null);
  private readonly _isRefreshing = signal(false);

  /** Read-only projection. */
  readonly accessToken = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();
  readonly isRefreshing = this._isRefreshing.asReadonly();
  readonly isAuthenticated = computed(() => this._accessToken() !== null);

  setTokens(tokens: TokenPairInput): void {
    this._accessToken.set(tokens.accessToken);
    this._refreshToken.set(tokens.refreshToken);
  }

  /** Update only the access token (e.g. after a silent refresh). */
  setAccessToken(accessToken: string): void {
    this._accessToken.set(accessToken);
  }

  /** Signal that a token refresh is in progress (for loading indicators). */
  setRefreshing(value: boolean): void {
    this._isRefreshing.set(value);
  }

  /** Wipe the entire session. */
  clear(): void {
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._isRefreshing.set(false);
  }
}

