/**
 * Primitive aliases for domain identifiers.
 */
export type UUID = string;
export type ISODateString = string;

/**
 * Standard envelope wrapping every backend response.
 * Components must never see this — unwrapping happens in ApiClientService.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Shape of a 400 validation-error body.
 */
export interface ApiValidationErrors {
  message: string;
  errors: Record<string, string[]>;
}

