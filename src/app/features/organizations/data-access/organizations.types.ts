import type { RoleCode, UUID } from '../../../core/models/api.models';

export type { RoleCode, PermissionCode, UUID, ISODateString } from '../../../core/models/api.models';
export type {
  OrganizationSummary,
  MemberWithRoles,
  OrganizationAccessProfile,
  MemberPermissionsResponse,
  CreateOrganizationRequest,
  AddMemberRequest,
  ReplaceMemberRolesRequest,
} from '../../../core/models/organization.models';

export interface MembershipSummary {
  membershipId: UUID;
  userId: UUID;
  status: string;
  roles: RoleCode[];
}
