import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { REASONS, ROUTES } from '../constants/ROUTES';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private readonly router: Router = inject(Router);

  public updateQuery(route: ActivatedRoute, params: Params | null, options?: NavigationExtras): void {
    void this.router.navigate([], {
      relativeTo: route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true,
      ...options,
    });
  }

  public toNode(uuid: string, options?: NavigationExtras): void {
    void this.router.navigate(['/', ROUTES.IDENTIFIER, uuid], { ...options });
  }

  public toNotFound(options?: NavigationExtras): void {
    void this.router.navigate(['/', ROUTES.NOT_FOUND], { ...options });
  }

  // Todo: Add query params for reasoning
  public toError(reason: REASONS, options?: NavigationExtras): void {
    void this.router.navigate(['/', ROUTES.ERROR], { queryParams: { reason }, ...options });
  }
}
