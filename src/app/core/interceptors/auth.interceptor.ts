import {
  HttpClient,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, from, switchMap, throwError } from 'rxjs';
import { AuthSessionStore } from '../auth/auth-session.store';
import { APP_CONFIG } from '../config/app-config';
import { ApiEnvelope } from '../../shared/types/api.types';
import { TokenPair } from '../models/auth.models';

/**
 * Paths that must never receive an Authorization header.
 * Checked against the request URL suffix (after the base URL).
 */
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/refresh-token',
  '/auth/logout',
] as const;

function isPublicPath(url: string): boolean {
  return PUBLIC_PATHS.some((p) => url.includes(p));
}

/**
 * Module-level guard prevents concurrent refresh storms.
 * The session store's isRefreshing signal mirrors this for UI consumers.
 */
let refreshInProgress = false;

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const session = inject(AuthSessionStore);
  const router = inject(Router);
  const http = inject(HttpClient);
  const config = inject(APP_CONFIG);

  // Attach token only to protected endpoints
  const token = session.accessToken();
  const authReq =
    token && !isPublicPath(req.url)
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only intercept 401s on protected, non-refresh endpoints
      if (
        error.status !== 401 ||
        isPublicPath(req.url) ||
        refreshInProgress
      ) {
        return throwError(() => error);
      }

      const refreshToken = session.refreshToken();
      if (!refreshToken) {
        session.clear();
        router.navigate(['/login']);
        return throwError(() => error);
      }

      refreshInProgress = true;
      session.setRefreshing(true);

      return from(
        firstValueFrom(
          http.post<ApiEnvelope<{ tokens: TokenPair }>>(
            `${config.apiBaseUrl}/auth/refresh-token`,
            { refreshToken },
          ),
        ),
      ).pipe(
        switchMap((res) => {
          refreshInProgress = false;
          session.setRefreshing(false);

          if (res?.success && res.data) {
            session.setTokens(res.data.tokens);
            const retried = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.data.tokens.accessToken}`,
              },
            });
            return next(retried);
          }

          session.clear();
          router.navigate(['/login']);
          return throwError(() => error);
        }),
        catchError((refreshError) => {
          refreshInProgress = false;
          session.setRefreshing(false);
          session.clear();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
