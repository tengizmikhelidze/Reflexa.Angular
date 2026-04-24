import { ISODateString, UUID } from './api.models';
export interface ViewerScopeSummary {
  id: UUID;
  organizationId: UUID;
  viewerUserId: UUID;
  targetUserId: UUID;
  grantedByUserId: UUID | null;
  createdAt: ISODateString;
}
export interface CreateViewerScopeRequest {
  organizationId: UUID;
  viewerUserId: UUID;
  targetUserId: UUID;
}
export interface ViewerScopeFilters {
  organizationId: UUID;
  viewerUserId?: UUID;
}
