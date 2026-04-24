import { computed, Injectable, signal } from '@angular/core';
import { inject } from '@angular/core';
import { ApiClientError, PermissionCode, UUID } from '../../core/models/api.models';
import { OrganizationSummary, MemberWithRoles, OrganizationAccessProfile, AddMemberRequest, CreateOrganizationRequest, ReplaceMemberRolesRequest } from '../../core/models/organization.models';
import { OrganizationsApiService } from '../../core/api/organizations-api.service';
@Injectable({ providedIn: 'root' })
export class OrganizationsStore {
  private readonly api = inject(OrganizationsApiService);
  private readonly _organizations = signal<OrganizationSummary[]>([]);
  private readonly _selectedOrganizationId = signal<UUID | null>(null);
  private readonly _currentAccess = signal<OrganizationAccessProfile | null>(null);
  private readonly _members = signal<MemberWithRoles[]>([]);
  private readonly _loading = signal(false);
  private readonly _membersLoading = signal(false);
  private readonly _error = signal<ApiClientError | null>(null);
  readonly organizations = this._organizations.asReadonly();
  readonly selectedOrganizationId = this._selectedOrganizationId.asReadonly();
  readonly currentAccess = this._currentAccess.asReadonly();
  readonly members = this._members.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly membersLoading = this._membersLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedOrganization = computed(() => {
    const id = this._selectedOrganizationId();
    return this._organizations().find((o) => o.id === id) ?? this._currentAccess()?.organization ?? null;
  });
  readonly hasSelectedOrganization = computed(() => this._selectedOrganizationId() !== null);
  readonly effectivePermissions = computed(() => this._currentAccess()?.effectivePermissions ?? []);
  readonly isOrgAdmin = computed(() => this._currentAccess()?.membership.roles.includes('ORG_ADMIN') ?? false);
  readonly isTrainer = computed(() => this._currentAccess()?.membership.roles.includes('TRAINER') ?? false);
  readonly canManageUsers = computed(() => this.hasPermission('users.manage'));
  readonly canManageTeams = computed(() => this.hasPermission('teams.manage'));
  readonly canManageDevices = computed(() => this.hasPermission('devices.manage'));
  readonly canManagePresets = computed(() => this.hasPermission('presets.manage'));
  readonly canStartSession = computed(() => this.hasPermission('session.start'));
  readonly canEndSession = computed(() => this.hasPermission('session.end'));
  readonly canAssignSession = computed(() => this.hasPermission('session.assign'));
  readonly canDeleteSession = computed(() => this.hasPermission('session.delete'));
  readonly canManageViewerScopes = computed(() => this.hasPermission('viewer.scope.manage'));
  hasPermission(code: PermissionCode): boolean {
    return this.effectivePermissions().includes(code);
  }
  async loadOrganizations(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await this.api.list();
      this._organizations.set(res.organizations);
    } catch (e) {
      this._error.set(e as ApiClientError);
    } finally {
      this._loading.set(false);
    }
  }
  async createOrganization(input: CreateOrganizationRequest): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await this.api.create(input);
      this._organizations.update((orgs) => [...orgs, res.organization]);
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    } finally {
      this._loading.set(false);
    }
  }
  async selectOrganization(id: UUID): Promise<void> {
    this._selectedOrganizationId.set(id);
    await this.loadCurrentAccess();
  }
  async loadCurrentAccess(): Promise<void> {
    const id = this._selectedOrganizationId();
    if (!id) return;
    try {
      const res = await this.api.getMyAccess(id);
      this._currentAccess.set(res);
    } catch (e) {
      this._error.set(e as ApiClientError);
    }
  }
  async loadMembers(): Promise<void> {
    const id = this._selectedOrganizationId();
    if (!id) return;
    this._membersLoading.set(true);
    try {
      const res = await this.api.listMembers(id);
      this._members.set(res.members);
    } catch (e) {
      this._error.set(e as ApiClientError);
    } finally {
      this._membersLoading.set(false);
    }
  }
  async addMember(input: AddMemberRequest): Promise<void> {
    const id = this._selectedOrganizationId();
    if (!id) return;
    this._membersLoading.set(true);
    try {
      const res = await this.api.addMember(id, input);
      this._members.update((m) => [...m, res.member]);
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    } finally {
      this._membersLoading.set(false);
    }
  }
  async replaceMemberRoles(membershipId: UUID, roleCodes: string[]): Promise<void> {
    const id = this._selectedOrganizationId();
    if (!id) return;
    try {
      await this.api.replaceMemberRoles(id, membershipId, { roleCodes: roleCodes as ReplaceMemberRolesRequest['roleCodes'] });
      await this.loadMembers();
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    }
  }
  clearError(): void {
    this._error.set(null);
  }
}
