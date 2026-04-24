import { computed, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { ApiClientError } from '../../core/models/api.models';
import { SafeUser, LoginRequest, RegisterRequest } from '../../core/models/auth.models';
import { AuthApiService } from '../../core/api/auth-api.service';
import { AuthTokenStore } from '../../core/auth/auth-token.store';
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authApi = inject(AuthApiService);
  private readonly tokenStore = inject(AuthTokenStore);
  private readonly router = inject(Router);
  private readonly _loading = signal(false);
  private readonly _error = signal<ApiClientError | null>(null);
  private readonly _successMessage = signal<string | null>(null);
  readonly user = this.tokenStore.user;
  readonly isAuthenticated = this.tokenStore.isAuthenticated;
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly successMessage = this._successMessage.asReadonly();
  readonly isSuperAdmin = computed(() => this.user()?.isSuperAdmin ?? false);
  readonly emailVerified = computed(() => this.user()?.emailVerified ?? false);
  readonly displayName = computed(() => {
    const u = this.user();
    if (!u) return '';
    return u.displayName ?? u.firstName ?? u.email;
  });
  async register(input: RegisterRequest): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    this._successMessage.set(null);
    try {
      await this.authApi.register(input);
      this._successMessage.set('Registration successful! Please check your email to verify your account.');
    } catch (e) {
      this._error.set(e as ApiClientError);
    } finally {
      this._loading.set(false);
    }
  }
  async login(input: LoginRequest): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await this.authApi.login(input);
      this.tokenStore.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
      this.tokenStore.setUser(res.user);
      await this.router.navigate(['/dashboard']);
    } catch (e) {
      this._error.set(e as ApiClientError);
    } finally {
      this._loading.set(false);
    }
  }
  async verifyEmail(token: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await this.authApi.verifyEmail({ token });
      this._successMessage.set('Email verified successfully! You can now log in.');
    } catch (e) {
      this._error.set(e as ApiClientError);
    } finally {
      this._loading.set(false);
    }
  }
  async refresh(): Promise<boolean> {
    const rt = this.tokenStore.refreshToken();
    if (!rt) return false;
    try {
      const res = await this.authApi.refreshToken({ refreshToken: rt });
      this.tokenStore.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }
  async logout(): Promise<void> {
    const rt = this.tokenStore.refreshToken();
    try {
      if (rt) await this.authApi.logout({ refreshToken: rt });
    } catch { /* ignore */ }
    this.clearSession();
    await this.router.navigate(['/login']);
  }
  async loadMe(): Promise<void> {
    try {
      const res = await this.authApi.me();
      this.tokenStore.setUser(res.user);
    } catch {
      this.clearSession();
    }
  }
  clearSession(): void {
    this.tokenStore.clear();
  }
  clearError(): void {
    this._error.set(null);
    this._successMessage.set(null);
  }
}
