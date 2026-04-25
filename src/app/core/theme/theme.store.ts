import { computed, inject, Injectable, signal } from '@angular/core';
import type { ThemeMode, ThemePresetName, ThemeSettings } from './theme.types';
import { ThemeService } from './theme.service';

const STORAGE_KEY = 'reflexa-theme';

const DEFAULT_MODE: ThemeMode = 'system';
const DEFAULT_PRESET: ThemePresetName = 'Aura';
const DEFAULT_PRIMARY = 'emerald';
const DEFAULT_SURFACE = 'slate';

@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly themeService = inject(ThemeService);

  private readonly _mode = signal<ThemeMode>(DEFAULT_MODE);
  private readonly _preset = signal<ThemePresetName>(DEFAULT_PRESET);
  private readonly _primaryColor = signal<string>(DEFAULT_PRIMARY);
  private readonly _surfaceColor = signal<string>(DEFAULT_SURFACE);
  private readonly _systemPrefersDark = signal<boolean>(false);

  readonly mode = this._mode.asReadonly();
  readonly preset = this._preset.asReadonly();
  readonly primaryColor = this._primaryColor.asReadonly();
  readonly surfaceColor = this._surfaceColor.asReadonly();
  readonly systemPrefersDark = this._systemPrefersDark.asReadonly();

  readonly isDarkMode = computed(
    () => this._mode() === 'dark' || (this._mode() === 'system' && this._systemPrefersDark()),
  );

  readonly currentSettings = computed((): ThemeSettings => ({
    mode: this._mode(),
    preset: this._preset(),
    primaryColor: this._primaryColor(),
    surfaceColor: this._surfaceColor(),
  }));

  constructor() {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    this._systemPrefersDark.set(mq.matches);
    mq.addEventListener('change', (e) => {
      this._systemPrefersDark.set(e.matches);
      if (this._mode() === 'system') {
        this.themeService.applyDarkMode(e.matches);
      }
    });

    this.loadFromStorage();
  }

  setMode(mode: ThemeMode): void {
    this._mode.set(mode);
    this.themeService.applyDarkMode(this.isDarkMode());
    this.saveToStorage();
  }

  setPreset(preset: ThemePresetName): void {
    this._preset.set(preset);
    void this.themeService.applyPreset(preset);
    this.saveToStorage();
  }

  setPrimaryColor(color: string): void {
    this._primaryColor.set(color);
    this.themeService.applyPrimaryColor(color);
    this.saveToStorage();
  }

  setSurfaceColor(color: string): void {
    this._surfaceColor.set(color);
    this.themeService.applySurfaceColor(color);
    this.saveToStorage();
  }

  resetTheme(): void {
    this._mode.set(DEFAULT_MODE);
    this._preset.set(DEFAULT_PRESET);
    this._primaryColor.set(DEFAULT_PRIMARY);
    this._surfaceColor.set(DEFAULT_SURFACE);
    this.themeService.applyDarkMode(this.isDarkMode());
    void this.themeService.applyPreset(DEFAULT_PRESET);
    this.themeService.applyPrimaryColor(DEFAULT_PRIMARY);
    this.themeService.applySurfaceColor(DEFAULT_SURFACE);
    this.saveToStorage();
  }

  loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const settings: Partial<ThemeSettings> = JSON.parse(raw);
      if (settings.mode) this._mode.set(settings.mode);
      if (settings.preset) this._preset.set(settings.preset);
      if (settings.primaryColor) this._primaryColor.set(settings.primaryColor);
      if (settings.surfaceColor) this._surfaceColor.set(settings.surfaceColor);
      this.themeService.applyDarkMode(this.isDarkMode());
      if (settings.preset) void this.themeService.applyPreset(settings.preset);
      if (settings.primaryColor) this.themeService.applyPrimaryColor(settings.primaryColor);
      if (settings.surfaceColor) this.themeService.applySurfaceColor(settings.surfaceColor);
    } catch {
      // corrupt storage — leave defaults in place
    }
  }

  saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentSettings()));
  }
}
