import { inject } from '@angular/core';
import { PartialMatchRouteSnapshot, RedirectFunction, UrlTree } from '@angular/router';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { Node } from '../models/Node';
import { ViewService } from '../services/view.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ParseUtils } from '../utils/ParseUtils';
import { NavigationService } from '../services/navigation.service';
import { PARAMS, REASONS } from '../app.routes';

export const viewRedirect: RedirectFunction = async (route: PartialMatchRouteSnapshot): Promise<UrlTree> => {
  const navigationService: NavigationService = inject(NavigationService);
  const viewService: ViewService = inject(ViewService);

  const uuid: string | undefined = ParseUtils.parseString(route.params[PARAMS.UUID]);
  if (!uuid) return navigationService.notFoundTree();

  return firstValueFrom(
    viewService.fetchNode(uuid).pipe(
      map((node: Node): UrlTree => {
        if (node._labels.includes('Collection')) return navigationService.collectionTree(uuid);
        if (node._labels.includes('Entity')) return navigationService.entityTree(uuid);
        return navigationService.notFoundTree();
      }),
      catchError((error: unknown): Observable<UrlTree> => {
        if (error instanceof HttpErrorResponse && error.status === 404) return of(navigationService.notFoundTree());
        return of(navigationService.errorTree(REASONS.SERVER));
      }),
    ),
  );
};
