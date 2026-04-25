import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '../../../core/api/api-client.service';
import type {
  CreateDeviceKitRequest,
  DeviceKitDetail,
  DeviceKitSummary,
  GrantKitAccessRequest,
  HubSummary,
  KitAccessGrant,
  PodSummary,
  ReassignPodRequest,
  RegisterHubRequest,
  RegisterPodsRequest,
  UUID,
} from './devices.types';

@Injectable({ providedIn: 'root' })
export class DevicesApi {
  private readonly api = inject(ApiClientService);

  createKit(body: CreateDeviceKitRequest): Promise<{ kit: DeviceKitSummary }> {
    return this.api.post('/devices/kits', body);
  }

  listKits(): Promise<{ kits: DeviceKitSummary[] }> {
    return this.api.get('/devices/kits');
  }

  getKit(kitId: UUID): Promise<{ kit: DeviceKitDetail }> {
    return this.api.get(`/devices/kits/${kitId}`);
  }

  registerHub(kitId: UUID, body: RegisterHubRequest): Promise<{ hub: HubSummary }> {
    return this.api.post(`/devices/kits/${kitId}/hub`, body);
  }

  registerPods(kitId: UUID, body: RegisterPodsRequest): Promise<{ pods: PodSummary[] }> {
    return this.api.post(`/devices/kits/${kitId}/pods`, body);
  }

  listPods(kitId: UUID): Promise<{ pods: PodSummary[] }> {
    return this.api.get(`/devices/kits/${kitId}/pods`);
  }

  grantAccess(kitId: UUID, body: GrantKitAccessRequest): Promise<{ access: KitAccessGrant }> {
    return this.api.post(`/devices/kits/${kitId}/access`, body);
  }

  listAccessGrants(kitId: UUID): Promise<{ accessGrants: KitAccessGrant[] }> {
    return this.api.get(`/devices/kits/${kitId}/access`);
  }

  reassignPod(podId: UUID, body: ReassignPodRequest): Promise<{ pod: PodSummary }> {
    return this.api.post(`/devices/pods/${podId}/reassign`, body);
  }
}
