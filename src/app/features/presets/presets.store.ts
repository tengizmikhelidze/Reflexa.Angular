import { Injectable, signal } from '@angular/core';
import { inject } from '@angular/core';
import { ApiClientError, UUID } from '../../core/models/api.models';
import { PresetDetail, PresetFilters, PresetSummary, CreatePresetRequest, UpdatePresetRequest } from '../../core/models/preset.models';
import { PresetsApiService } from '../../core/api/presets-api.service';
@Injectable({ providedIn: 'root' })
export class PresetsStore {
  private readonly api = inject(PresetsApiService);
  private readonly _presets = signal<PresetSummary[]>([]);
  private readonly _selectedPresetId = signal<UUID | null>(null);
  private readonly _selectedPreset = signal<PresetDetail | null>(null);
  private readonly _filters = signal<PresetFilters>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<ApiClientError | null>(null);
  readonly presets = this._presets.asReadonly();
  readonly selectedPresetId = this._selectedPresetId.asReadonly();
  readonly selectedPreset = this._selectedPreset.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  async loadPresets(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const res = await this.api.list(this._filters());
      this._presets.set(res.presets);
    } catch (e) {
      this._error.set(e as ApiClientError);
    } finally {
      this._loading.set(false);
    }
  }
  async selectPreset(id: UUID): Promise<void> {
    this._selectedPresetId.set(id);
    try {
      const res = await this.api.get(id);
      this._selectedPreset.set(res.preset);
    } catch (e) {
      this._error.set(e as ApiClientError);
    }
  }
  async createPreset(input: CreatePresetRequest): Promise<void> {
    this._loading.set(true);
    try {
      const res = await this.api.create(input);
      this._presets.update((p) => [...p, res.preset]);
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    } finally {
      this._loading.set(false);
    }
  }
  async updatePreset(id: UUID, input: UpdatePresetRequest): Promise<void> {
    try {
      const res = await this.api.update(id, input);
      this._presets.update((p) => p.map((preset) => (preset.id === id ? res.preset : preset)));
      if (this._selectedPreset()?.id === id) this._selectedPreset.set(res.preset);
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    }
  }
  async deletePreset(id: UUID): Promise<void> {
    try {
      await this.api.delete(id);
      this._presets.update((p) => p.filter((preset) => preset.id !== id));
      if (this._selectedPresetId() === id) {
        this._selectedPresetId.set(null);
        this._selectedPreset.set(null);
      }
    } catch (e) {
      this._error.set(e as ApiClientError);
      throw e;
    }
  }
  updateFilters(filters: Partial<PresetFilters>): void {
    this._filters.update((f) => ({ ...f, ...filters }));
  }
  clearError(): void {
    this._error.set(null);
  }
}
