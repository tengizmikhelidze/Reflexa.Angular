import { computed, Injectable, signal } from '@angular/core';
import { inject } from '@angular/core';
import { ApiClientError, UUID } from '../../core/models/api.models';
import { SessionDetail, SessionFilters, SessionSummary, AssignSessionRequest, SyncSessionRequest } from '../../core/models/session.models';
import { SessionsApiService } from '../../core/api/sessions-api.service';
@Injectable({ providedIn: 'root' })
export class SessionsStore {
  private readonly api = inject(SessionsApiService);
  private readonly _sessions = signal<SessionSummary[]>([]);
  private readonly _selectedSessionId = signal<UUID | null>(null);
  private readonly _selectedSession = signal<SessionDetail | null>(null);
  private readonly _filters = signal<SessionFilters>({});
  private readonly _loading = signal(false);
  private readonly _detailLoading = signal(false);
  private readonly _syncing = signal(false);
  private readonly _error = signal<ApiClientError | null>(null);
  readonly sessions = this._sessions.asReadonly();
  readonly selectedSessionId = this._selectedSessionId.asReadonly();
  readonly selectedSession = this._selectedSession.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly detailLoading = this._detailLoading.asReadonly();
  readonly syncing = this._syncing.asReadonly();
  readonly error = this._error.asReadonly();
  readonly completedSessions = computed(() => this._sessions().filter((s) => s.status === 'COMPLETED'));
  readonly failedSessions = computed(() => this._sessions().filter((s) => s.status === 'FAILED'));
  readonly totalHits = computed(() => this._sessions().reduce((a, s) => a + s.hitCount, 0));
  readonly totalMisses = computed(() => this._sessions().reduce((a, s) => a + s.missCount, 0));
  readonly averageReactionMs = computed(() => {
    const valid = this._sessions().filter((s) => s.avgReactionMs !== null);
    if (!valid.length) return null;
    return valid.reduce((a, s) => a + (s.avgReactionMs ?? 0), 0) / valid.length;
  });
  readonly selectedSessionEvents = computed(() => this._selectedSession()?.events ?? []);
  async loadSessions(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await this.api.list(this._filters());
      this._sessions.set(res.sessions);
    } catch (e) {
      this._error.set(e as ApiClientError);
    } finally {
      this._loading.set(false);
    }
  }
  updateFilters(filters: Partial<SessionFilters>): void {
    this._filters.update((f) => ({ ...f, ...filters }));
  }
  async selectSession(id: UUID): Promise<void> {
    this._selectedSessionId.set(id);
    await this.loadSessionDetail(id);
  }
  async loadSessionDetail(id: UUID): Promise<void> {
    this._detailLoading.set(true);
    try {
      const res = await this.api.get(id);
      this._selectedSession.set(res.session);
    } catch (e) {
      this._error.set(e as ApiClientError);
    } finally {
      this._detailLoading.set(false);
    }
  }
  async syncSession(input: SyncSessionRequest): Promise<void> {
    this._syncing.set(true);
    try {
      await this.api.sync(input);
      await this.loadSessions();
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    } finally {
      this._syncing.set(false);
    }
  }
  async assignSession(sessionId: UUID, input: AssignSessionRequest): Promise<void> {
    try {
      const res = await this.api.assign(sessionId, input);
      this._sessions.update((sessions) => sessions.map((s) => (s.id === sessionId ? res.session : s)));
      if (this._selectedSession()?.id === sessionId) {
        this._selectedSession.update((s) => s ? { ...s, ...res.session } : s);
      }
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    }
  }
  async deleteSession(sessionId: UUID): Promise<void> {
    try {
      await this.api.delete(sessionId);
      this._sessions.update((sessions) => sessions.filter((s) => s.id !== sessionId));
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    }
  }
  clearError(): void {
    this._error.set(null);
  }
}
