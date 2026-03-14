import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn) {
    router.navigate(['/login']);
    return false;
  }
  if (!auth.isAdmin) {
    router.navigate(['/home']);
    return false;
  }
  return true;
};
