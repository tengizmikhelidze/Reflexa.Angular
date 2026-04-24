import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthStore } from '../../../features/auth/data-access/auth.store';
import { OrganizationsStore } from '../../../features/organizations/organizations.store';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, ButtonModule],
  template: `
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <span class="sidebar-logo">⚡</span>
        <span class="sidebar-title">Reflexa</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
        <i class="pi pi-home"></i> Dashboard
      </a>
      <a routerLink="/organizations" routerLinkActive="active" class="nav-item">
        <i class="pi pi-building"></i> Organizations
      </a>
      @if (orgStore.hasSelectedOrganization()) {
        <a routerLink="/devices" routerLinkActive="active" class="nav-item">
          <i class="pi pi-tablet"></i> Devices
        </a>
        <a routerLink="/sessions" routerLinkActive="active" class="nav-item">
          <i class="pi pi-chart-bar"></i> Sessions
        </a>
        <a routerLink="/presets" routerLinkActive="active" class="nav-item">
          <i class="pi pi-sliders-h"></i> Presets
        </a>
        @if (orgStore.canManageTeams()) {
          <a routerLink="/teams" routerLinkActive="active" class="nav-item">
            <i class="pi pi-users"></i> Teams
          </a>
        }
        @if (orgStore.canManageViewerScopes()) {
          <a routerLink="/viewer-scopes" routerLinkActive="active" class="nav-item">
            <i class="pi pi-eye"></i> Viewer Scopes
          </a>
        }
      }
    </nav>
    <div class="sidebar-footer">
      <p-button
        label="Logout"
        icon="pi pi-sign-out"
        severity="secondary"
        [text]="true"
        size="small"
        (onClick)="logout()"
      />
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; }
    .sidebar-header { padding: 1.25rem 1rem; border-bottom: 1px solid var(--p-surface-200); }
    .sidebar-brand { display: flex; align-items: center; gap: 0.5rem; }
    .sidebar-logo { font-size: 1.5rem; }
    .sidebar-title { font-size: 1.1rem; font-weight: 700; color: var(--p-primary-500); }
    .sidebar-nav { flex: 1; padding: 0.75rem 0; }
    .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 1rem; color: var(--p-surface-700); text-decoration: none; font-size: 0.9rem; border-radius: 6px; margin: 2px 8px; transition: background 0.2s; }
    .nav-item:hover { background: var(--p-surface-100); }
    .nav-item.active { background: var(--p-primary-50); color: var(--p-primary-600); font-weight: 600; }
    .sidebar-footer { padding: 0.75rem 1rem; border-top: 1px solid var(--p-surface-200); }
  `]
})
export class SidebarComponent {
  protected readonly authStore = inject(AuthStore);
  protected readonly orgStore = inject(OrganizationsStore);
  logout(): void {
    this.authStore.logout();
  }
}
