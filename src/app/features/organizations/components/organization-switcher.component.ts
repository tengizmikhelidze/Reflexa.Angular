import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { OrganizationsStore } from '../data-access/organizations.store';

@Component({
  selector: 'app-organization-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectModule, FormsModule],
  template: `
    @if (store.organizations().length > 0) {
      <p-select
        [options]="store.organizations()"
        [ngModel]="store.selectedOrganizationId()"
        (ngModelChange)="store.selectOrganization($event)"
        optionLabel="name"
        optionValue="id"
        placeholder="Select Organization"
        [style]="{ minWidth: '200px' }"
      />
    } @else {
      <span>No organizations</span>
    }
  `,
})
export class OrganizationSwitcherComponent implements OnInit {
  protected readonly store = inject(OrganizationsStore);

  ngOnInit(): void {
    this.store.loadOrganizations();
  }
}
