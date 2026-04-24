import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OrganizationsStore } from '../../features/organizations/organizations.store';
export const organizationSelectedGuard: CanActivateFn = () => {
  const orgStore = inject(OrganizationsStore);
  const router = inject(Router);
  if (orgStore.hasSelectedOrganization()) return true;
  return router.createUrlTree(['/organizations']);
};
