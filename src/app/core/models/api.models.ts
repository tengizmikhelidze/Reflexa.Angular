// Re-exported from canonical locations — existing imports remain valid.
export type { UUID, ISODateString, ApiEnvelope, ApiValidationErrors } from '../../shared/types/api.types';
export { ApiClientError } from '../errors/api-client-error';
export type { ApiClientErrorOptions } from '../errors/api-client-error';

// Backend-specific domain codes kept here.
export interface PaginationQuery {
  limit?: number;
  offset?: number;
}

export type RoleCode = 'ORG_ADMIN' | 'TRAINER' | 'ATHLETE' | 'VIEWER';

export type PermissionCode =
  | 'users.manage'
  | 'teams.manage'
  | 'devices.manage'
  | 'presets.manage'
  | 'session.start'
  | 'session.end'
  | 'session.assign'
  | 'session.delete'
  | 'viewer.scope.manage';
