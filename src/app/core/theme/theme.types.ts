export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemePresetName = 'Aura' | 'Lara' | 'Nora';

export interface ThemePresetOption {
  label: string;
  value: ThemePresetName;
}

export interface ThemePrimaryOption {
  label: string;
  value: string;
  palette: Record<string, string>;
}

export interface ThemeSurfaceOption {
  label: string;
  value: string;
  palette: Record<string, string>;
}

export interface ThemeSettings {
  mode: ThemeMode;
  preset: ThemePresetName;
  primaryColor: string;
  surfaceColor: string;
}
