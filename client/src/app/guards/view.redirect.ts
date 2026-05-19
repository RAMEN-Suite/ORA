import { inject } from '@angular/core';
import { PartialMatchRouteSnapshot, RedirectFunction, Router, UrlTree } from '@angular/router';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { PARAMS, REASONS, ROUTES } from '../constants/ROUTES';
import { Node } from '../models/Node';
import { ViewService } from '../services/view.service';
import { Utils } from '../utils/Utils';
import { HttpErrorResponse } from '@angular/common/http';

export const viewRedirect: RedirectFunction = async (route: PartialMatchRouteSnapshot): Promise<UrlTree> => {
  const viewService: ViewService = inject(ViewService);
  const router: Router = inject(Router);

  const uuid: string | undefined = Utils.parseString(route.params[PARAMS.UUID]);
  if (!uuid) return router.createUrlTree(['/', ROUTES.NOT_FOUND]);

  return firstValueFrom(
    viewService.fetchNode(uuid).pipe(
      map((node: Node): UrlTree => {
        if (node._labels.includes('Collection')) return router.createUrlTree(['/', ROUTES.COLLECTION, uuid]);
        if (node._labels.includes('Entity')) return router.createUrlTree(['/', ROUTES.ENTITY, uuid]);
        return router.createUrlTree(['/', ROUTES.NOT_FOUND]);
      }),
      catchError((error: unknown): Observable<UrlTree> => {
        if (error instanceof HttpErrorResponse && error.status === 404) return of(router.createUrlTree(['/', ROUTES.NOT_FOUND]));
        return of(router.createUrlTree(['/', ROUTES.ERROR], { queryParams: { reason: REASONS.SERVER } }));
      }),
    ),
  );
};
