import { Injectable, signal } from '@angular/core';
import { inject } from '@angular/core';
import { ApiClientError, UUID } from '../../core/models/api.models';
import { ViewerScopeSummary, CreateViewerScopeRequest, ViewerScopeFilters } from '../../core/models/viewer-scope.models';
import { ViewerScopesApiService } from '../../core/api/viewer-scopes-api.service';
@Injectable({ providedIn: 'root' })
export class ViewerScopesStore {
  private readonly api = inject(ViewerScopesApiService);
  private readonly _scopes = signal<ViewerScopeSummary[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<ApiClientError | null>(null);
  readonly scopes = this._scopes.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  async loadScopes(organizationId: UUID, viewerUserId?: UUID): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const filters: ViewerScopeFilters = { organizationId, viewerUserId };
      const res = await this.api.list(filters);
      this._scopes.set(res.scopes);
    } catch (e) {
      this._error.set(e as ApiClientError);
    } finally {
      this._loading.set(false);
    }
  }
  async createScope(input: CreateViewerScopeRequest): Promise<void> {
    try {
      const res = await this.api.create(input);
      this._scopes.update((s) => [...s, res.scope]);
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    }
  }
  async deleteScope(scopeId: UUID): Promise<void> {
    try {
      await this.api.delete(scopeId);
      this._scopes.update((s) => s.filter((scope) => scope.id !== scopeId));
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    }
  }
  clearError(): void {
    this._error.set(null);
  }
}
