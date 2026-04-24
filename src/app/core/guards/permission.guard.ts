import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { OrganizationsStore } from '../../features/organizations/organizations.store';
import { PermissionCode } from '../models/api.models';
export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const orgStore = inject(OrganizationsStore);
  const router = inject(Router);
  const permission = route.data['permission'] as PermissionCode;
  if (!permission || orgStore.hasPermission(permission)) return true;
  return router.createUrlTree(['/forbidden']);
};
