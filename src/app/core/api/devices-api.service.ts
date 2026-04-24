import { inject, Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { UUID } from '../models/api.models';
import { CreateDeviceKitRequest, DeviceKitDetail, DeviceKitSummary, GrantKitAccessRequest, KitAccessGrant, PodSummary, ReassignPodRequest, RegisterHubRequest, RegisterPodsRequest, HubSummary } from '../models/device.models';
@Injectable({ providedIn: 'root' })
export class DevicesApiService {
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
