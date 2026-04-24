import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <h2>Dashboard</h2>
    </div>
    <p style="color: var(--p-surface-500)">Welcome to Reflexa. Select an organization to get started.</p>
  `
})
export class DashboardComponent {}

