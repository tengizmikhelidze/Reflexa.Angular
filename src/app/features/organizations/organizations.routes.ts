import { Routes } from '@angular/router';
import { organizationSelectedGuard } from '../../core/guards/organization-selected.guard';
import { permissionGuard } from '../../core/guards/permission.guard';

export const ORGANIZATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/organizations.page').then((m) => m.OrganizationsPage),
  },
  {
    path: 'members',
    canActivate: [organizationSelectedGuard, permissionGuard],
    data: { permission: 'users.manage' },
    loadComponent: () =>
      import('./pages/organization-members.page').then((m) => m.OrganizationMembersPage),
  },
  {
    path: 'access',
    canActivate: [organizationSelectedGuard],
    loadComponent: () =>
      import('./pages/organization-access.page').then((m) => m.OrganizationAccessPage),
  },
];
