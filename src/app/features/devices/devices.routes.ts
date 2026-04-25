import { Routes } from '@angular/router';
import { organizationSelectedGuard } from '../../core/guards/organization-selected.guard';

export const DEVICES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [organizationSelectedGuard],
    loadComponent: () =>
      import('./pages/device-kits.page').then((m) => m.DeviceKitsPage),
  },
  {
    path: ':kitId',
    canActivate: [organizationSelectedGuard],
    loadComponent: () =>
      import('./pages/device-kit-detail.page').then((m) => m.DeviceKitDetailPage),
  },
];
