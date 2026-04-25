import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthStore } from '../../../features/auth/data-access/auth.store';
import { OrganizationSwitcherComponent } from '../../../features/organizations/components/organization-switcher.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrganizationSwitcherComponent],
  template: `
    <div class="topbar-left">
      <app-organization-switcher />
    </div>
    <div class="topbar-right">
      <span class="user-name">{{ authStore.displayName() }}</span>
    </div>
  `,
  styles: [`
    :host { display: flex; align-items: center; justify-content: space-between; width: 100%; }
    .topbar-left { display: flex; align-items: center; gap: 1rem; }
    .topbar-right { display: flex; align-items: center; gap: 0.75rem; }
    .user-name { font-size: 0.875rem; font-weight: 500; color: var(--p-surface-700); }
  `]
})
export class TopbarComponent {
  protected readonly authStore = inject(AuthStore);
}
