import { Routes } from '@angular/router';
import { EntitiesScreen } from './view/screens/entities-screen/entities.screen';
import { configGuard } from './guards/config.guard';
import { ErrorScreen } from './view/screens/error-screen/error.screen';
import { CollectionScreen } from './view/screens/collection-screen/collection.screen';
import { CollectionsScreen } from './view/screens/collections-screen/collections.screen';
import { EntityScreen } from './view/screens/entity-screen/entity.screen';
import { NotFoundScreen } from './view/screens/not-found-screen/not-found.screen';
import { viewRedirect } from './guards/view.redirect';
import { PARAMS, ROUTES } from './constants/ROUTES';

export const routes: Routes = [
  {
    path: '',
    canActivate: [configGuard],
    children: [
      { path: `${ROUTES.IDENTIFIER}/:${PARAMS.UUID}`, redirectTo: viewRedirect },
      { path: ROUTES.COLLECTIONS, component: CollectionsScreen },
      { path: ROUTES.ENTITIES, component: EntitiesScreen },
      { path: `${ROUTES.ENTITY}/:${PARAMS.UUID}`, component: EntityScreen },
      { path: `${ROUTES.COLLECTION}/:${PARAMS.UUID}`, component: CollectionScreen },
    ],
  },
  { path: ROUTES.NOT_FOUND, component: NotFoundScreen },
  { path: ROUTES.ERROR, component: ErrorScreen },
  { path: '**', redirectTo: ROUTES.NOT_FOUND },
];
