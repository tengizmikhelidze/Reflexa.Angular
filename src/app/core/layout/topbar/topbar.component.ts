import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../../features/auth/auth.store';
import { OrganizationsStore } from '../../../features/organizations/organizations.store';
import { OrganizationSummary } from '../../models/organization.models';
@Component({
  selector: 'app-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectModule, FormsModule],
  template: `
    <div class="topbar-left">
      @if (orgStore.organizations().length > 0) {
        <p-select
          [options]="orgStore.organizations()"
          [ngModel]="orgStore.selectedOrganizationId()"
          (ngModelChange)="onOrgChange($event)"
          optionLabel="name"
          optionValue="id"
          placeholder="Select Organization"
          [style]="{ minWidth: '200px' }"
        />
      } @else {
        <span class="no-org-hint">No organization selected</span>
      }
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
    .no-org-hint { font-size: 0.875rem; color: var(--p-surface-500); }
  `]
})
export class TopbarComponent {
  protected readonly authStore = inject(AuthStore);
  protected readonly orgStore = inject(OrganizationsStore);
  onOrgChange(id: string): void {
    this.orgStore.selectOrganization(id);
  }
}
