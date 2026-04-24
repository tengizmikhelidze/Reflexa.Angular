import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import { ApiEnvelope } from '../../shared/types/api.types';
import { ApiClientError } from '../errors/api-client-error';

export interface RequestOptions {
  /** Additional query params merged with any typed params argument. */
  params?: Record<string, string | number | boolean | undefined>;
}

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_CONFIG).apiBaseUrl;

  async get<TResponse>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<TResponse> {
    let httpParams = new HttpParams();
    if (params) {
      for (const [key, val] of Object.entries(params)) {
        if (val !== undefined && val !== null) {
          httpParams = httpParams.set(key, String(val));
        }
      }
    }
    return this.execute<TResponse>(
      firstValueFrom(
        this.http.get<ApiEnvelope<TResponse>>(`${this.base}${path}`, { params: httpParams }),
      ),
    );
  }

  async post<TBody, TResponse>(path: string, body: TBody): Promise<TResponse> {
    return this.execute<TResponse>(
      firstValueFrom(
        this.http.post<ApiEnvelope<TResponse>>(`${this.base}${path}`, body),
      ),
    );
  }

  async patch<TBody, TResponse>(path: string, body: TBody): Promise<TResponse> {
    return this.execute<TResponse>(
      firstValueFrom(
        this.http.patch<ApiEnvelope<TResponse>>(`${this.base}${path}`, body),
      ),
    );
  }

  async delete<TResponse = void>(path: string): Promise<TResponse> {
    return this.execute<TResponse>(
      firstValueFrom(
        this.http.delete<ApiEnvelope<TResponse>>(`${this.base}${path}`),
      ),
    );
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  private async execute<T>(promise: Promise<ApiEnvelope<T>>): Promise<T> {
    try {
      const envelope = await promise;
      return this.unwrap(envelope);
    } catch (err) {
      throw this.normalizeError(err);
    }
  }

  private unwrap<T>(envelope: ApiEnvelope<T>): T {
    if (!envelope.success) {
      throw new ApiClientError({
        message: envelope.message ?? 'Request failed',
        validationErrors: envelope.errors,
      });
    }
    return envelope.data as T;
  }

  /**
   * Converts any thrown value to ApiClientError.
   * Preserves HTTP status codes and backend validation errors.
   */
  private normalizeError(err: unknown): ApiClientError {
    if (err instanceof ApiClientError) return err;

    if (err instanceof HttpErrorResponse) {
      const body =
        typeof err.error === 'object' &&
        err.error !== null &&
        'success' in (err.error as object)
          ? (err.error as ApiEnvelope<unknown>)
          : null;

      return new ApiClientError({
        message: body?.message ?? err.message ?? 'Network error',
        status: err.status,
        validationErrors: body?.errors,
        originalError: err,
      });
    }

    if (err instanceof Error) {
      return new ApiClientError({
        message: err.message,
        originalError: err,
      });
    }

    return new ApiClientError({
      message: 'An unexpected error occurred',
      originalError: err,
    });
  }
}
