import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';

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
      ...options,
    });
  }
}
