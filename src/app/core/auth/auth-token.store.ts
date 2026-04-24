import { computed, Injectable, signal } from '@angular/core';
import { SafeUser } from '../models/auth.models';
@Injectable({ providedIn: 'root' })
export class AuthTokenStore {
  private readonly _accessToken = signal<string | null>(null);
  private readonly _refreshToken = signal<string | null>(null);
  private readonly _user = signal<SafeUser | null>(null);
  readonly accessToken = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._accessToken() !== null);
  setTokens(accessToken: string, refreshToken: string): void {
    this._accessToken.set(accessToken);
    this._refreshToken.set(refreshToken);
  }
  setAccessToken(token: string): void {
    this._accessToken.set(token);
  }
  setUser(user: SafeUser): void {
    this._user.set(user);
  }
  clear(): void {
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._user.set(null);
  }
}
