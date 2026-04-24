import { ISODateString, UUID } from './api.models';
export type SessionStatus = 'COMPLETED' | 'CANCELLED' | 'FAILED';
export type EndMode = 'TIME' | 'TARGET' | 'REPETITION' | 'EARLY_END';
export type SessionOrigin = 'OFFLINE_SYNC' | 'WEB' | 'ADMIN_CREATE';
export type SyncStatus = 'PENDING' | 'SYNCED' | 'CONFLICT';
export interface SessionSummary {
  id: UUID;
  organizationId: UUID;
  deviceKitId: UUID;
  hubDeviceId: UUID | null;
  startedByUserId: UUID | null;
  assignedToUserId: UUID | null;
  assignedByUserId: UUID | null;
  teamId: UUID | null;
  origin: SessionOrigin;
  syncStatus: SyncStatus;
  clientSessionId: string | null;
  status: SessionStatus;
  endMode: EndMode;
  presetId: UUID | null;
  trainingMode: string;
  sessionStartedAt: ISODateString;
  sessionEndedAt: ISODateString;
  durationMs: number;
  score: number | null;
  hitCount: number;
  missCount: number;
  accuracyPercent: number | null;
  avgReactionMs: number | null;
  bestReactionMs: number | null;
  worstReactionMs: number | null;
  activePodCount: number;
  totalEventsCount: number;
  notes: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
export interface ActivePod {
  id: UUID;
  podDeviceId: UUID;
  podOrder: number | null;
}
export interface SessionEvent {
  id: UUID;
  podDeviceId: UUID | null;
  eventIndex: number;
  eventType: string;
  eventTimestamp: ISODateString;
  elapsedMs: number | null;
  reactionTimeMs: number | null;
  isCorrect: boolean | null;
  payloadJson: Record<string, unknown> | null;
}
export interface SessionDetail extends SessionSummary {
  configJson: Record<string, unknown>;
  activePods: ActivePod[];
  events: SessionEvent[];
}
export interface SyncSessionRequest {
  clientSessionId: string;
  organizationId: UUID;
  deviceKitId: UUID;
  origin: SessionOrigin;
  status: SessionStatus;
  endMode: EndMode;
  trainingMode: string;
  configJson: Record<string, unknown>;
  sessionStartedAt: ISODateString;
  sessionEndedAt: ISODateString;
  durationMs: number;
  hitCount: number;
  missCount: number;
  score?: number;
  notes?: string;
  activePods?: ActivePod[];
  events?: SessionEvent[];
}
export interface AssignSessionRequest {
  assignedToUserId?: UUID;
  teamId?: UUID;
}
export interface SessionFilters {
  organizationId?: UUID;
  assignedToUserId?: UUID;
  teamId?: UUID;
  limit?: number;
  offset?: number;
}
