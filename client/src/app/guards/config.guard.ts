import { CanActivateFn, UrlTree } from '@angular/router';
import { ConfigService } from '../services/config.service';
import { inject } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { REASONS } from '../app.routes';

export const configGuard: CanActivateFn = (): true | UrlTree => {
  const navigationService: NavigationService = inject(NavigationService);
  const configService: ConfigService = inject(ConfigService);

  if (configService.hasConfig()) return true;
  return navigationService.errorTree(REASONS.CONFIG);
};
