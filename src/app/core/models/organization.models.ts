import { ISODateString, RoleCode, UUID } from './api.models';
export interface OrganizationSummary {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: ISODateString;
}
export interface MemberWithRoles {
  membershipId: UUID;
  userId: UUID;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  status: string;
  joinedAt: ISODateString;
  roles: RoleCode[];
}
export interface OrganizationAccessProfile {
  organization: OrganizationSummary;
  membership: {
    membershipId: UUID;
    userId: UUID;
    status: string;
    roles: RoleCode[];
  };
  effectivePermissions: string[];
}
export interface MemberPermissionsResponse {
  membershipId: UUID;
  userId: UUID;
  organizationId: UUID;
  permissions: string[];
}
export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  description?: string;
}
export interface AddMemberRequest {
  email: string;
  roleCodes?: RoleCode[];
}
export interface ReplaceMemberRolesRequest {
  roleCodes: RoleCode[];
}
