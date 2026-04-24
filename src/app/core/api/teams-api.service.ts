import { inject, Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { UUID } from '../models/api.models';
import { AddTeamMemberRequest, CreateTeamRequest, TeamDetail, TeamMemberSummary, TeamSummary } from '../models/team.models';
@Injectable({ providedIn: 'root' })
export class TeamsApiService {
  private readonly api = inject(ApiClientService);
  create(body: CreateTeamRequest): Promise<{ team: TeamDetail }> {
    return this.api.post('/teams', body);
  }
  list(organizationId?: UUID): Promise<{ teams: TeamSummary[] }> {
    return this.api.get('/teams', organizationId ? { organizationId } : undefined);
  }
  get(id: UUID): Promise<{ team: TeamDetail }> {
    return this.api.get(`/teams/${id}`);
  }
  addMember(teamId: UUID, body: AddTeamMemberRequest): Promise<{ members: TeamMemberSummary[] }> {
    return this.api.post(`/teams/${teamId}/members`, body);
  }
  listMembers(teamId: UUID): Promise<{ members: TeamMemberSummary[] }> {
    return this.api.get(`/teams/${teamId}/members`);
  }
  removeMember(teamId: UUID, userId: UUID): Promise<void> {
    return this.api.delete(`/teams/${teamId}/members/${userId}`);
  }
}
