import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ThemeStore } from '../../../core/theme/theme.store';
import { PRIMARY_COLORS, SURFACE_COLORS } from '../../../core/theme/theme.service';
import { ThemePresetOption } from '../../../core/theme/theme.types';

@Component({
  selector: 'app-theme-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, SelectModule, ButtonModule],
  styles: [`
    .theme-section { margin-bottom: 1.5rem; }
    .theme-section-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--app-muted);
      margin-bottom: 0.5rem;
    }
    .color-swatches { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .color-swatch {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform 0.15s;
    }
    .color-swatch:hover { transform: scale(1.15); }
    .color-swatch.selected { border-color: var(--app-text); transform: scale(1.1); }
  `],
  template: `
    <div class="theme-section">
      <div class="theme-section-title">Appearance</div>
      <p-select
        [options]="modeOptions"
        [ngModel]="store.mode()"
        (ngModelChange)="store.setMode($event)"
        optionLabel="label"
        optionValue="value"
        [style]="{ width: '100%' }"
      />
    </div>

    <div class="theme-section">
      <div class="theme-section-title">Preset</div>
      <p-select
        [options]="presetOptions"
        [ngModel]="store.preset()"
        (ngModelChange)="store.setPreset($event)"
        optionLabel="label"
        optionValue="value"
        [style]="{ width: '100%' }"
      />
    </div>

    <div class="theme-section">
      <div class="theme-section-title">Primary Color</div>
      <div class="color-swatches">
        @for (color of primaryColors; track color.value) {
          <button
            type="button"
            class="color-swatch"
            [class.selected]="store.primaryColor() === color.value"
            [style.background-color]="color.palette['500']"
            [title]="color.label"
            (click)="store.setPrimaryColor(color.value)"
          ></button>
        }
      </div>
    </div>

    <div class="theme-section">
      <div class="theme-section-title">Surface Color</div>
      <div class="color-swatches">
        @for (color of surfaceColors; track color.value) {
          <button
            type="button"
            class="color-swatch"
            [class.selected]="store.surfaceColor() === color.value"
            [style.background-color]="color.palette['500']"
            [title]="color.label"
            (click)="store.setSurfaceColor(color.value)"
          ></button>
        }
      </div>
    </div>

    <div class="theme-section">
      <p-button
        label="Reset to defaults"
        severity="secondary"
        [outlined]="true"
        (onClick)="store.resetTheme()"
      />
    </div>
  `,
})
export class ThemeSettingsComponent {
  protected readonly store = inject(ThemeStore);
  protected readonly primaryColors = PRIMARY_COLORS;
  protected readonly surfaceColors = SURFACE_COLORS;

  protected readonly modeOptions = [
    { label: 'Light', value: 'light', icon: 'pi pi-sun' },
    { label: 'Dark', value: 'dark', icon: 'pi pi-moon' },
    { label: 'System', value: 'system', icon: 'pi pi-desktop' },
  ];

  protected readonly presetOptions: ThemePresetOption[] = [
    { label: 'Aura', value: 'Aura' },
    { label: 'Lara', value: 'Lara' },
    { label: 'Nora', value: 'Nora' },
  ];
}
