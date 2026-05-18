import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { ConfigService } from '../services/config.service';
import { inject } from '@angular/core';

export const configGuard: CanActivateFn = (): true | UrlTree => {
  const config: ConfigService = inject(ConfigService);
  const router: Router = inject(Router);

  if (config.hasConfig()) return true;
  return router.createUrlTree(['/error']);
};
