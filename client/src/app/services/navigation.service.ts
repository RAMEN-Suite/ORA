import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Params, Router, UrlTree } from '@angular/router';
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
    void this.router.navigate(this.nodeLink(uuid), { ...options });
  }

  public nodeTree(uuid: string): UrlTree {
    return this.router.createUrlTree(this.nodeLink(uuid));
  }

  public nodeLink(uuid: string): string[] {
    return ['/', ROUTES.IDENTIFIER, uuid];
  }

  public collectionTree(uuid: string): UrlTree {
    return this.router.createUrlTree(this.collectionLink(uuid));
  }

  public collectionLink(uuid: string): string[] {
    return ['/', ROUTES.COLLECTIONS, uuid];
  }

  public entityTree(uuid: string): UrlTree {
    return this.router.createUrlTree(this.entityLink(uuid));
  }

  public entityLink(uuid: string): string[] {
    return ['/', ROUTES.ENTITIES, uuid];
  }

  public toNotFound(options?: NavigationExtras): void {
    void this.router.navigate(this.notFoundLink(), { replaceUrl: true, ...options });
  }

  public notFoundTree(): UrlTree {
    return this.router.createUrlTree(this.notFoundLink());
  }

  public notFoundLink(): string[] {
    return ['/', ROUTES.NOT_FOUND];
  }

  public toError(reason: REASONS, options?: NavigationExtras): void {
    void this.router.navigate(this.errorLink(), { queryParams: { reason }, replaceUrl: true, ...options });
  }

  public errorTree(reason: REASONS): UrlTree {
    return this.router.createUrlTree(this.errorLink(), { queryParams: { reason } });
  }

  public errorLink(): string[] {
    return ['/', ROUTES.ERROR];
  }
}
