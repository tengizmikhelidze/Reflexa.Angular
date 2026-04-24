export interface ApiClientErrorOptions {
  message: string;
  /** HTTP status code (0 = network failure, undefined = not from HTTP). */
  status?: number;
  /** Field-level validation errors from a 400 response. */
  validationErrors?: Record<string, string[]>;
  /** The raw underlying error for debugging. */
  originalError?: unknown;
}

/**
 * Unified error thrown by ApiClientService for every non-successful response.
 * Feature code should catch this type — never raw HttpErrorResponse.
 */
export class ApiClientError extends Error {
  readonly status: number | undefined;
  readonly validationErrors: Record<string, string[]> | undefined;
  readonly originalError: unknown;

  constructor(options: ApiClientErrorOptions) {
    super(options.message);
    this.name = 'ApiClientError';
    this.status = options.status;
    this.validationErrors = options.validationErrors;
    this.originalError = options.originalError;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isValidationError(): boolean {
    return this.status === 400 && !!this.validationErrors;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isServerError(): boolean {
    return (this.status ?? 0) >= 500;
  }
}

