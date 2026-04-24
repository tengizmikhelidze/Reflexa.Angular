import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiClientError } from '../../../core/errors/api-client-error';
import { AuthSessionStore } from '../../../core/auth/auth-session.store';
import { AuthApi } from './auth.api';
import type { LoginRequest, RegisterRequest, SafeUser } from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authApi = inject(AuthApi);
  private readonly session = inject(AuthSessionStore);
  private readonly router = inject(Router);

  private readonly _user = signal<SafeUser | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<ApiClientError | null>(null);
  private readonly _resendLoading = signal(false);
  private readonly _resendError = signal<ApiClientError | null>(null);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly resendLoading = this._resendLoading.asReadonly();
  readonly resendError = this._resendError.asReadonly();

  readonly isAuthenticated = computed(() => this.session.accessToken() !== null);
  readonly isSuperAdmin = computed(() => this._user()?.isSuperAdmin ?? false);
  readonly emailVerified = computed(() => this._user()?.emailVerified ?? false);
  readonly displayName = computed(() => {
    const u = this._user();
    if (!u) return '';
    return u.displayName ?? u.firstName ?? u.email;
  });

  async register(input: RegisterRequest): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await this.authApi.register(input);
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
      this.session.setTokens(res.tokens);
      this._user.set(res.user);
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
    } catch (e) {
      this._error.set(e as ApiClientError);
    } finally {
      this._loading.set(false);
    }
  }

  async loadMe(): Promise<void> {
    if (!this.session.accessToken()) return;
    try {
      const res = await this.authApi.me();
      this._user.set(res.user);
    } catch (e) {
      if (e instanceof ApiClientError && e.isUnauthorized) {
        this.clearSession();
      }
    }
  }

  async logout(): Promise<void> {
    const rt = this.session.refreshToken();
    try {
      if (rt) await this.authApi.logout({ refreshToken: rt });
    } catch {
      // ignore logout errors — session is cleared regardless
    }
    this.clearSession();
    await this.router.navigate(['/login']);
  }

  clearSession(): void {
    this.session.clear();
    this._user.set(null);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    this._resendLoading.set(true);
    this._resendError.set(null);
    try {
      await this.authApi.resendVerificationEmail({ email });
    } catch (e) {
      this._resendError.set(e as ApiClientError);
    } finally {
      this._resendLoading.set(false);
    }
  }

  clearError(): void {
    this._error.set(null);
  }

  clearResendError(): void {
    this._resendError.set(null);
  }
}
