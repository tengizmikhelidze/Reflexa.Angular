import { inject, Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { UUID } from '../models/api.models';
import { CreatePresetRequest, PresetDetail, PresetFilters, PresetSummary, UpdatePresetRequest } from '../models/preset.models';
@Injectable({ providedIn: 'root' })
export class PresetsApiService {
  private readonly api = inject(ApiClientService);
  create(body: CreatePresetRequest): Promise<{ preset: PresetDetail }> {
    return this.api.post('/presets', body);
  }
  list(filters?: PresetFilters): Promise<{ presets: PresetSummary[] }> {
    return this.api.get('/presets', filters as Record<string, string | number | boolean | undefined>);
  }
  get(id: UUID): Promise<{ preset: PresetDetail }> {
    return this.api.get(`/presets/${id}`);
  }
  update(id: UUID, body: UpdatePresetRequest): Promise<{ preset: PresetDetail }> {
    return this.api.patch(`/presets/${id}`, body);
  }
  delete(id: UUID): Promise<void> {
    return this.api.delete(`/presets/${id}`);
  }
}
