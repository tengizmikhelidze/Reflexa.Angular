import { ISODateString, UUID } from './api.models';
export interface DeviceKitSummary {
  id: UUID;
  organizationId: UUID;
  name: string;
  code: string;
  description: string | null;
  ownerUserId: UUID | null;
  maxPods: number;
  createdAt: ISODateString;
}
export interface HubSummary {
  id: UUID;
  hardwareUid: string;
  serialNumber: string | null;
  firmwareVersion: string | null;
  bluetoothName: string | null;
  isActive: boolean;
  lastSeenAt: ISODateString | null;
}
export interface PodSummary {
  id: UUID;
  hardwareUid: string;
  serialNumber: string | null;
  firmwareVersion: string | null;
  currentDeviceKitId: UUID | null;
  displayName: string | null;
  logicalIndex: number | null;
  batteryPercent: number | null;
  batteryLevel: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  isActive: boolean;
  lastSeenAt: ISODateString | null;
}
export interface DeviceKitDetail extends DeviceKitSummary {
  hub: HubSummary | null;
  podCount: number;
}
export interface KitAccessGrant {
  id: UUID;
  deviceKitId: UUID;
  userId: UUID;
  canOperate: boolean;
  canManage: boolean;
  grantedByUserId: UUID | null;
  createdAt: ISODateString;
}
export interface CreateDeviceKitRequest {
  organizationId: UUID;
  name: string;
  code: string;
  description?: string;
  maxPods?: number;
}
export interface RegisterHubRequest {
  hardwareUid: string;
  serialNumber?: string;
  firmwareVersion?: string;
  bluetoothName?: string;
}
export interface RegisterPodsRequest {
  pods: {
    hardwareUid: string;
    serialNumber?: string;
    firmwareVersion?: string;
    displayName?: string;
    logicalIndex?: number;
  }[];
}
export interface GrantKitAccessRequest {
  userId: UUID;
  canOperate: boolean;
  canManage: boolean;
}
export interface ReassignPodRequest {
  targetDeviceKitId: UUID;
}
