import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiEnvelope } from '../../shared/types/api.types';
import { ApiClientError } from '../errors/api-client-error';

/**
 * Outermost interceptor. Converts any HttpErrorResponse that escapes the
 * inner interceptors (e.g. after auth failed to recover a 401) into a typed
 * ApiClientError with HTTP status, backend message, and validation errors.
 *
 * Position in chain: [errorInterceptor, authInterceptor]
 *   → errors flow: backend → authInterceptor → errorInterceptor
 *
 * Does NOT show toast or navigate — that responsibility belongs to stores.
 */
export const errorInterceptor: HttpInterceptorFn = (_req, next) => {
  return next(_req).pipe(
    catchError((err: unknown) => {
      // Already normalized — pass through.
      if (err instanceof ApiClientError) {
        return throwError(() => err);
      }

      if (err instanceof HttpErrorResponse) {
        const body = extractApiBody(err);
        return throwError(
          () =>
            new ApiClientError({
              message: body?.message ?? err.message ?? 'Network error',
              status: err.status,
              validationErrors: body?.errors,
              originalError: err,
            }),
        );
      }

      // Non-HTTP errors (e.g. JSON parse failures) — wrap generically.
      if (err instanceof Error) {
        return throwError(
          () =>
            new ApiClientError({
              message: err.message,
              originalError: err,
            }),
        );
      }

      return throwError(
        () =>
          new ApiClientError({
            message: 'An unexpected error occurred',
            originalError: err,
          }),
      );
    }),
  );
};

function extractApiBody(err: HttpErrorResponse): ApiEnvelope<unknown> | null {
  if (
    typeof err.error === 'object' &&
    err.error !== null &&
    'success' in (err.error as object)
  ) {
    return err.error as ApiEnvelope<unknown>;
  }
  return null;
}

