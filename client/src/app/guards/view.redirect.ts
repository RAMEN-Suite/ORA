import { inject } from '@angular/core';
import { PartialMatchRouteSnapshot, RedirectFunction, Router, UrlTree } from '@angular/router';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { PARAMS, ROUTES } from '../app.routes';
import { Node } from '../models/Node';
import { ViewService } from '../services/view.service';
import { Utils } from '../utils/Utils';

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
      catchError((): Observable<UrlTree> => of(router.createUrlTree(['/', ROUTES.NOT_FOUND]))),
    ),
  );
};
