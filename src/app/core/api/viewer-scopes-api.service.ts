import { inject, Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { UUID } from '../models/api.models';
import { CreateViewerScopeRequest, ViewerScopeFilters, ViewerScopeSummary } from '../models/viewer-scope.models';
@Injectable({ providedIn: 'root' })
export class ViewerScopesApiService {
  private readonly api = inject(ApiClientService);
  create(body: CreateViewerScopeRequest): Promise<{ scope: ViewerScopeSummary }> {
    return this.api.post('/viewer-scopes', body);
  }
  list(filters: ViewerScopeFilters): Promise<{ scopes: ViewerScopeSummary[] }> {
    return this.api.get('/viewer-scopes', filters as unknown as Record<string, string | number | boolean | undefined>);
  }
  delete(scopeId: UUID): Promise<void> {
    return this.api.delete(`/viewer-scopes/${scopeId}`);
  }
}
