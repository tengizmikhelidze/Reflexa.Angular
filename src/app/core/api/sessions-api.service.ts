import { inject, Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { UUID } from '../models/api.models';
import { AssignSessionRequest, SessionDetail, SessionFilters, SessionSummary, SyncSessionRequest } from '../models/session.models';
@Injectable({ providedIn: 'root' })
export class SessionsApiService {
  private readonly api = inject(ApiClientService);
  sync(body: SyncSessionRequest): Promise<{ session: SessionSummary }> {
    return this.api.post('/sessions/sync', body);
  }
  list(filters?: SessionFilters): Promise<{ sessions: SessionSummary[] }> {
    return this.api.get('/sessions', filters as Record<string, string | number | boolean | undefined>);
  }
  get(id: UUID): Promise<{ session: SessionDetail }> {
    return this.api.get(`/sessions/${id}`);
  }
  assign(id: UUID, body: AssignSessionRequest): Promise<{ session: SessionSummary }> {
    return this.api.patch(`/sessions/${id}/assign`, body);
  }
  delete(id: UUID): Promise<void> {
    return this.api.delete(`/sessions/${id}`);
  }
}
