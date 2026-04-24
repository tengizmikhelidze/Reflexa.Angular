import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthTokenStore } from '../auth/auth-token.store';
export const authGuard: CanActivateFn = () => {
  const tokenStore = inject(AuthTokenStore);
  const router = inject(Router);
  if (tokenStore.isAuthenticated()) return true;
  return router.createUrlTree(['/login']);
};
