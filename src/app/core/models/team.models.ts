import { ISODateString, UUID } from './api.models';
export interface TeamSummary {
  id: UUID;
  organizationId: UUID;
  name: string;
  description: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
export interface TeamDetail extends TeamSummary {
  memberCount: number;
}
export interface TeamMemberSummary {
  id: UUID;
  teamId: UUID;
  userId: UUID;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  joinedAt: ISODateString;
}
export interface CreateTeamRequest {
  organizationId: UUID;
  name: string;
  description?: string;
}
export interface AddTeamMemberRequest {
  userId: UUID;
}
