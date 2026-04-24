import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './core/layout/auth-layout/auth-layout.component';
import { AppLayoutComponent } from './core/layout/app-layout/app-layout.component';
import { ForbiddenComponent } from './core/errors/forbidden/forbidden.component';
import { NotFoundComponent } from './core/errors/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { organizationSelectedGuard } from './core/guards/organization-selected.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  // ── Public (Guest only) ────────────────────────────────────────────────────
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/pages/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./features/auth/pages/verify-email/verify-email.component').then(
            (m) => m.VerifyEmailComponent
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ── Authenticated ──────────────────────────────────────────────────────────
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'organizations',
        loadComponent: () =>
          import(
            './features/organizations/pages/organization-list/organization-list.component'
          ).then((m) => m.OrganizationListComponent),
      },
      {
        path: 'organizations/:orgId/members',
        canActivate: [organizationSelectedGuard, permissionGuard],
        data: { permission: 'users.manage' },
        loadComponent: () =>
          import(
            './features/organizations/pages/organization-members/organization-members.component'
          ).then((m) => m.OrganizationMembersComponent),
      },

      // Devices
      {
        path: 'devices',
        canActivate: [organizationSelectedGuard],
        loadComponent: () =>
          import('./features/devices/pages/device-list/device-list.component').then(
            (m) => m.DeviceListComponent
          ),
      },
      {
        path: 'devices/:kitId',
        canActivate: [organizationSelectedGuard],
        loadComponent: () =>
          import(
            './features/devices/pages/device-detail/device-detail.component'
          ).then((m) => m.DeviceDetailComponent),
      },

      // Sessions
      {
        path: 'sessions',
        canActivate: [organizationSelectedGuard],
        loadComponent: () =>
          import('./features/sessions/pages/session-list/session-list.component').then(
            (m) => m.SessionListComponent
          ),
      },
      {
        path: 'sessions/:sessionId',
        canActivate: [organizationSelectedGuard],
        loadComponent: () =>
          import(
            './features/sessions/pages/session-detail/session-detail.component'
          ).then((m) => m.SessionDetailComponent),
      },

      // Presets
      {
        path: 'presets',
        canActivate: [organizationSelectedGuard],
        loadComponent: () =>
          import('./features/presets/pages/preset-list/preset-list.component').then(
            (m) => m.PresetListComponent
          ),
      },
      {
        path: 'presets/:presetId',
        canActivate: [organizationSelectedGuard],
        loadComponent: () =>
          import(
            './features/presets/pages/preset-detail/preset-detail.component'
          ).then((m) => m.PresetDetailComponent),
      },

      // Teams
      {
        path: 'teams',
        canActivate: [organizationSelectedGuard, permissionGuard],
        data: { permission: 'teams.manage' },
        loadComponent: () =>
          import('./features/teams/pages/team-list/team-list.component').then(
            (m) => m.TeamListComponent
          ),
      },
      {
        path: 'teams/:teamId',
        canActivate: [organizationSelectedGuard, permissionGuard],
        data: { permission: 'teams.manage' },
        loadComponent: () =>
          import('./features/teams/pages/team-detail/team-detail.component').then(
            (m) => m.TeamDetailComponent
          ),
      },

      // Viewer Scopes
      {
        path: 'viewer-scopes',
        canActivate: [organizationSelectedGuard, permissionGuard],
        data: { permission: 'viewer.scope.manage' },
        loadComponent: () =>
          import(
            './features/viewer-scopes/pages/viewer-scopes-list/viewer-scopes-list.component'
          ).then((m) => m.ViewerScopesListComponent),
      },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // ── Error pages ────────────────────────────────────────────────────────────
  { path: 'forbidden', component: ForbiddenComponent },
  { path: '**', component: NotFoundComponent },
];
