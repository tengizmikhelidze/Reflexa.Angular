import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiClientError } from '../../../core/errors/api-client-error';
import { OrganizationsStore } from '../../organizations/data-access/organizations.store';
import { DevicesApi } from './devices.api';
import type {
  CreateDeviceKitRequest,
  DeviceKitDetail,
  DeviceKitSummary,
  GrantKitAccessRequest,
  KitAccessGrant,
  PodSummary,
  ReassignPodRequest,
  RegisterHubRequest,
  RegisterPodsRequest,
  UUID,
} from './devices.types';

@Injectable({ providedIn: 'root' })
export class DevicesStore {
  private readonly api = inject(DevicesApi);
  private readonly orgStore = inject(OrganizationsStore);

  private readonly _kits = signal<DeviceKitSummary[]>([]);
  private readonly _selectedKitId = signal<UUID | null>(null);
  private readonly _selectedKit = signal<DeviceKitDetail | null>(null);
  private readonly _pods = signal<PodSummary[]>([]);
  private readonly _accessGrants = signal<KitAccessGrant[]>([]);
  private readonly _loading = signal(false);
  private readonly _detailLoading = signal(false);
  private readonly _error = signal<ApiClientError | null>(null);

  readonly kits = this._kits.asReadonly();
  readonly selectedKitId = this._selectedKitId.asReadonly();
  readonly selectedKit = this._selectedKit.asReadonly();
  readonly pods = this._pods.asReadonly();
  readonly accessGrants = this._accessGrants.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly detailLoading = this._detailLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly hasSelectedKit = computed(() => this._selectedKitId() !== null);
  readonly selectedKitHub = computed(() => this._selectedKit()?.hub ?? null);
  readonly hasHub = computed(() => this._selectedKit()?.hub != null);
  readonly activePods = computed(() => this._pods().filter((p) => p.isActive));
  readonly lowBatteryPods = computed(() => this._pods().filter((p) => p.batteryLevel === 'LOW'));
  readonly selectedKitPodCount = computed(() => this._selectedKit()?.podCount ?? 0);
  readonly canManageDevices = computed(() => this.orgStore.canManageDevices());

  async loadKits(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await this.api.listKits();
      this._kits.set(res.kits);
    } catch (e) {
      this._error.set(e as ApiClientError);
    } finally {
      this._loading.set(false);
    }
  }

  async createKit(input: CreateDeviceKitRequest): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await this.api.createKit(input);
      this._kits.update((kits) => [...kits, res.kit]);
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    } finally {
      this._loading.set(false);
    }
  }

  async selectKit(id: UUID): Promise<void> {
    this._selectedKitId.set(id);
    await this.loadKitDetail(id);
  }

  async loadKitDetail(id: UUID): Promise<void> {
    this._detailLoading.set(true);
    this._error.set(null);
    try {
      const res = await this.api.getKit(id);
      this._selectedKit.set(res.kit);
    } catch (e) {
      this._error.set(e as ApiClientError);
    } finally {
      this._detailLoading.set(false);
    }
  }

  async loadPods(kitId: UUID): Promise<void> {
    try {
      const res = await this.api.listPods(kitId);
      this._pods.set(res.pods);
    } catch (e) {
      this._error.set(e as ApiClientError);
    }
  }

  async registerHub(kitId: UUID, input: RegisterHubRequest): Promise<void> {
    try {
      await this.api.registerHub(kitId, input);
      await this.loadKitDetail(kitId);
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    }
  }

  async registerPods(kitId: UUID, input: RegisterPodsRequest): Promise<void> {
    try {
      await this.api.registerPods(kitId, input);
      await Promise.all([this.loadPods(kitId), this.loadKitDetail(kitId)]);
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    }
  }

  async loadAccessGrants(kitId: UUID): Promise<void> {
    try {
      const res = await this.api.listAccessGrants(kitId);
      this._accessGrants.set(res.accessGrants);
    } catch (e) {
      this._error.set(e as ApiClientError);
    }
  }

  async grantAccess(kitId: UUID, input: GrantKitAccessRequest): Promise<void> {
    try {
      const res = await this.api.grantAccess(kitId, input);
      this._accessGrants.update((grants) => {
        const idx = grants.findIndex((g) => g.userId === input.userId);
        if (idx >= 0) {
          const updated = [...grants];
          updated[idx] = res.access;
          return updated;
        }
        return [...grants, res.access];
      });
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    }
  }

  async reassignPod(podId: UUID, input: ReassignPodRequest): Promise<void> {
    try {
      const res = await this.api.reassignPod(podId, input);
      this._pods.update((pods) => pods.map((p) => (p.id === podId ? res.pod : p)));
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    }
  }

  clearError(): void {
    this._error.set(null);
  }
}
