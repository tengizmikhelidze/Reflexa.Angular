import { HttpClient, HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, from, switchMap, throwError } from 'rxjs';
import { AuthTokenStore } from '../auth/auth-token.store';
import { APP_CONFIG } from '../config/app-config';
import { ApiEnvelope } from '../../shared/types/api.types';
import { TokenPair } from '../models/auth.models';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const tokenStore = inject(AuthTokenStore);
  const router = inject(Router);
  const http = inject(HttpClient);
  const config = inject(APP_CONFIG);

  const token = tokenStore.accessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh-token') && !isRefreshing) {
        const refreshToken = tokenStore.refreshToken();
        if (!refreshToken) {
          tokenStore.clear();
          router.navigate(['/login']);
          return throwError(() => error);
        }
        isRefreshing = true;
        return from(
          firstValueFrom(
            http.post<ApiEnvelope<{ tokens: TokenPair }>>(
              `${config.apiBaseUrl}/auth/refresh-token`,
              { refreshToken },
            ),
          ),
        ).pipe(
          switchMap((res) => {
            isRefreshing = false;
            if (res?.success && res.data) {
              tokenStore.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
              const retried = req.clone({
                setHeaders: { Authorization: `Bearer ${res.data.tokens.accessToken}` },
              });
              return next(retried);
            }
            tokenStore.clear();
            router.navigate(['/login']);
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            tokenStore.clear();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
