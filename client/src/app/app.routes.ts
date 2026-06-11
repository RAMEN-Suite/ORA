import { Routes } from '@angular/router';
import { EntitiesScreen } from './view/screens/entities-screen/entities.screen';
import { configGuard } from './guards/config.guard';
import { ErrorScreen } from './view/screens/error-screen/error.screen';
import { CollectionScreen } from './view/screens/collection-screen/collection.screen';
import { CollectionsScreen } from './view/screens/collections-screen/collections.screen';
import { EntityScreen } from './view/screens/entity-screen/entity.screen';
import { NotFoundScreen } from './view/screens/not-found-screen/not-found.screen';
import { viewRedirect } from './guards/view.redirect';
import { PageScreen } from './view/screens/page-screen/page.screen';
import { HomeScreen } from './view/screens/home-screen/home.screen';

export enum ROUTES {
  ENTITIES = 'entities',
  COLLECTIONS = 'collections',
  IDENTIFIER = 'id',
  ERROR = 'error',
  NOT_FOUND = 'not-found',
}

export enum PARAMS {
  UUID = 'uuid',
}

export enum REASONS {
  CONFIG = 'config',
  SERVER = 'server',
}

export const routes: Routes = [
  { path: ROUTES.ERROR, component: ErrorScreen },
  {
    path: '',
    canActivate: [configGuard],
    children: [
      { path: '', component: HomeScreen },
      { path: `${ROUTES.IDENTIFIER}/:${PARAMS.UUID}`, redirectTo: viewRedirect },

      { path: ROUTES.COLLECTIONS, component: CollectionsScreen },
      { path: ROUTES.ENTITIES, component: EntitiesScreen },

      { path: `${ROUTES.ENTITIES}/:${PARAMS.UUID}`, component: EntityScreen },
      { path: `${ROUTES.COLLECTIONS}/:${PARAMS.UUID}`, component: CollectionScreen },

      { path: ROUTES.NOT_FOUND, component: NotFoundScreen },
      { path: '**', component: PageScreen },
    ],
  },
];
