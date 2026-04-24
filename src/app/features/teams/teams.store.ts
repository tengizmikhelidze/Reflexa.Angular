import { Injectable, signal } from '@angular/core';
import { inject } from '@angular/core';
import { ApiClientError, UUID } from '../../core/models/api.models';
import { TeamDetail, TeamMemberSummary, TeamSummary, CreateTeamRequest } from '../../core/models/team.models';
import { TeamsApiService } from '../../core/api/teams-api.service';
@Injectable({ providedIn: 'root' })
export class TeamsStore {
  private readonly api = inject(TeamsApiService);
  private readonly _teams = signal<TeamSummary[]>([]);
  private readonly _selectedTeamId = signal<UUID | null>(null);
  private readonly _selectedTeam = signal<TeamDetail | null>(null);
  private readonly _members = signal<TeamMemberSummary[]>([]);
  private readonly _loading = signal(false);
  private readonly _membersLoading = signal(false);
  private readonly _error = signal<ApiClientError | null>(null);
  readonly teams = this._teams.asReadonly();
  readonly selectedTeamId = this._selectedTeamId.asReadonly();
  readonly selectedTeam = this._selectedTeam.asReadonly();
  readonly members = this._members.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly membersLoading = this._membersLoading.asReadonly();
  readonly error = this._error.asReadonly();
  async loadTeams(organizationId?: UUID): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await this.api.list(organizationId);
      this._teams.set(res.teams);
    } catch (e) {
      this._error.set(e as ApiClientError);
    } finally {
      this._loading.set(false);
    }
  }
  async createTeam(input: CreateTeamRequest): Promise<void> {
    this._loading.set(true);
    try {
      const res = await this.api.create(input);
      this._teams.update((t) => [...t, res.team]);
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    } finally {
      this._loading.set(false);
    }
  }
  async selectTeam(id: UUID): Promise<void> {
    this._selectedTeamId.set(id);
    try {
      const res = await this.api.get(id);
      this._selectedTeam.set(res.team);
    } catch (e) {
      this._error.set(e as ApiClientError);
    }
  }
  async loadMembers(teamId: UUID): Promise<void> {
    this._membersLoading.set(true);
    try {
      const res = await this.api.listMembers(teamId);
      this._members.set(res.members);
    } catch (e) {
      this._error.set(e as ApiClientError);
    } finally {
      this._membersLoading.set(false);
    }
  }
  async addMember(teamId: UUID, userId: UUID): Promise<void> {
    try {
      const res = await this.api.addMember(teamId, { userId });
      this._members.set(res.members);
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    }
  }
  async removeMember(teamId: UUID, userId: UUID): Promise<void> {
    try {
      await this.api.removeMember(teamId, userId);
      this._members.update((m) => m.filter((member) => member.userId !== userId));
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    }
  }
  clearError(): void {
    this._error.set(null);
  }
}
