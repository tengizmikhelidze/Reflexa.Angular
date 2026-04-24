import { inject, Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { AddMemberRequest, CreateOrganizationRequest, MemberPermissionsResponse, MemberWithRoles, OrganizationAccessProfile, OrganizationSummary, ReplaceMemberRolesRequest } from '../models/organization.models';
import { UUID } from '../models/api.models';
@Injectable({ providedIn: 'root' })
export class OrganizationsApiService {
  private readonly api = inject(ApiClientService);
  create(body: CreateOrganizationRequest): Promise<{ organization: OrganizationSummary }> {
    return this.api.post('/organizations', body);
  }
  list(): Promise<{ organizations: OrganizationSummary[] }> {
    return this.api.get('/organizations');
  }
  getMyAccess(orgId: UUID): Promise<OrganizationAccessProfile> {
    return this.api.get(`/organizations/${orgId}/me`);
  }
  addMember(orgId: UUID, body: AddMemberRequest): Promise<{ member: MemberWithRoles }> {
    return this.api.post(`/organizations/${orgId}/members`, body);
  }
  listMembers(orgId: UUID): Promise<{ members: MemberWithRoles[] }> {
    return this.api.get(`/organizations/${orgId}/members`);
  }
  replaceMemberRoles(orgId: UUID, membershipId: UUID, body: ReplaceMemberRolesRequest): Promise<{ assignedRoles: string[] }> {
    return this.api.post(`/organizations/${orgId}/members/${membershipId}/roles`, body);
  }
  getMemberPermissions(orgId: UUID, membershipId: UUID): Promise<MemberPermissionsResponse> {
    return this.api.get(`/organizations/${orgId}/members/${membershipId}/permissions`);
  }
}
