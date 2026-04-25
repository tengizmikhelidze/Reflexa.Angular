import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-preset-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonModule],
  template: `
    <div class="page-header">
      <h2>Preset Detail</h2>
      <p-button label="Back to Presets" icon="pi pi-arrow-left" severity="secondary" [text]="true" routerLink="/presets" />
    </div>
    <p style="color: var(--app-muted)">Preset detail coming soon.</p>
  `
})
export class PresetDetailComponent {}

