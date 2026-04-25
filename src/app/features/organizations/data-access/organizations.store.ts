import { computed, Injectable, signal } from '@angular/core';
import { inject } from '@angular/core';
import { ApiClientError } from '../../../core/errors/api-client-error';
import { OrganizationsApi } from './organizations.api';
import type {
  AddMemberRequest,
  CreateOrganizationRequest,
  MemberPermissionsResponse,
  MemberWithRoles,
  OrganizationAccessProfile,
  OrganizationSummary,
  PermissionCode,
  RoleCode,
  UUID,
} from './organizations.types';

@Injectable({ providedIn: 'root' })
export class OrganizationsStore {
  private readonly api = inject(OrganizationsApi);

  private readonly _organizations = signal<OrganizationSummary[]>([]);
  private readonly _selectedOrganizationId = signal<UUID | null>(null);
  private readonly _currentAccess = signal<OrganizationAccessProfile | null>(null);
  private readonly _members = signal<MemberWithRoles[]>([]);
  private readonly _memberPermissions = signal<MemberPermissionsResponse | null>(null);
  private readonly _loading = signal(false);
  private readonly _membersLoading = signal(false);
  private readonly _error = signal<ApiClientError | null>(null);

  readonly organizations = this._organizations.asReadonly();
  readonly selectedOrganizationId = this._selectedOrganizationId.asReadonly();
  readonly members = this._members.asReadonly();
  readonly memberPermissions = this._memberPermissions.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly membersLoading = this._membersLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly selectedOrganization = computed(
    () =>
      this._organizations().find((o) => o.id === this._selectedOrganizationId()) ??
      this._currentAccess()?.organization ??
      null,
  );

  readonly hasSelectedOrganization = computed(() => this._selectedOrganizationId() !== null);

  readonly currentMembership = computed(() => this._currentAccess()?.membership ?? null);

  readonly effectivePermissions = computed(
    () => this._currentAccess()?.effectivePermissions ?? [],
  );

  readonly isOrgAdmin = computed(
    () => this._currentAccess()?.membership.roles.includes('ORG_ADMIN') ?? false,
  );

  readonly isTrainer = computed(
    () => this._currentAccess()?.membership.roles.includes('TRAINER') ?? false,
  );

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
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await this.api.getMyAccess(id);
      this._currentAccess.set(res);
    } catch (e) {
      this._error.set(e as ApiClientError);
    } finally {
      this._loading.set(false);
    }
  }

  async loadMembers(): Promise<void> {
    const id = this._selectedOrganizationId();
    if (!id) return;
    this._membersLoading.set(true);
    this._error.set(null);
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
    this._error.set(null);
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

  async replaceMemberRoles(membershipId: UUID, roleCodes: RoleCode[]): Promise<void> {
    const id = this._selectedOrganizationId();
    if (!id) return;
    this._membersLoading.set(true);
    this._error.set(null);
    try {
      await this.api.replaceMemberRoles(id, membershipId, { roleCodes });
      await this.loadMembers();
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    } finally {
      this._membersLoading.set(false);
    }
  }

  async loadMemberPermissions(membershipId: UUID): Promise<void> {
    const id = this._selectedOrganizationId();
    if (!id) return;
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await this.api.getMemberPermissions(id, membershipId);
      this._memberPermissions.set(res);
    } catch (e) {
      this._error.set(e as ApiClientError);
    } finally {
      this._loading.set(false);
    }
  }

  clearError(): void {
    this._error.set(null);
  }
}
