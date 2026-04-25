import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { OrganizationsStore } from '../data-access/organizations.store';
import { PermissionBadgesComponent } from '../components/permission-badges.component';

@Component({
  selector: 'app-organization-access-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, MessageModule, TagModule, PermissionBadgesComponent],
  template: `
    <div class="page-header">
      <h2>My Access — {{ store.selectedOrganization()?.name ?? '' }}</h2>
      <p-button
        label="Refresh"
        icon="pi pi-refresh"
        severity="secondary"
        (onClick)="store.loadCurrentAccess()"
      />
    </div>

    @if (store.error()) {
      <p-message severity="error" [text]="store.error()!.message" styleClass="mb-4" />
    }

    @if (store.currentMembership(); as membership) {
      <div class="access-cards">
        <div class="access-card">
          <h3>Membership</h3>
          <div class="field-row">
            <span class="label">Status</span>
            <p-tag
              [value]="membership.status"
              [severity]="membership.status === 'active' ? 'success' : 'warn'"
            />
          </div>
          <div class="field-row">
            <span class="label">Roles</span>
            <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
              @for (role of membership.roles; track role) {
                <p-tag [value]="role" severity="info" />
              }
            </div>
          </div>
        </div>

        <div class="access-card">
          <h3>Effective Permissions</h3>
          <app-permission-badges [permissions]="store.effectivePermissions()" />
        </div>
      </div>
    } @else {
      <p>No access information available.</p>
    }
  `,
  styles: [
    `
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
      }
      .page-header h2 {
        margin: 0;
      }
      .access-cards {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .access-card {
        background: var(--app-surface);
        border: 1px solid var(--app-border);
        border-radius: 8px;
        padding: 1.25rem;
      }
      .access-card h3 {
        margin: 0 0 1rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--app-text);
      }
      .field-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
      }
      .label {
        min-width: 80px;
        font-size: 0.875rem;
        color: var(--app-muted);
      }
    `,
  ],
})
export class OrganizationAccessPage implements OnInit {
  protected readonly store = inject(OrganizationsStore);

  ngOnInit(): void {
    this.store.loadCurrentAccess();
  }
}
