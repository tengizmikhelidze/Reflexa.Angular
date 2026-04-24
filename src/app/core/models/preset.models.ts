import { ISODateString, UUID } from './api.models';
export type PresetScope = 'USER' | 'ORGANIZATION';
export interface PresetSummary {
  id: UUID;
  organizationId: UUID | null;
  createdByUserId: UUID;
  scope: PresetScope;
  name: string;
  description: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
export interface PresetDetail extends PresetSummary {
  configJson: Record<string, unknown>;
}
export interface CreatePresetRequest {
  scope: PresetScope;
  organizationId?: UUID;
  name: string;
  description?: string;
  configJson: Record<string, unknown>;
}
export interface UpdatePresetRequest {
  name?: string;
  description?: string;
  configJson?: Record<string, unknown>;
}
export interface PresetFilters {
  scope?: PresetScope;
  organizationId?: UUID;
  createdByUserId?: UUID;
}
