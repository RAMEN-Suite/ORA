import { Routes } from '@angular/router';
import { EntitiesScreen } from './view/pages/entities-screen/entities.screen';
import { CollectionsScreen } from './view/pages/collections-screen/collections.screen';
import { configGuard } from './guards/config.guard';
import { ErrorScreen } from './view/pages/error-screen/error.screen';

export enum ROUTES {
  ENTITIES = 'entities',
  ENTITY = 'entity',
  COLLECTIONS = 'collections',
  COLLECTION = 'collection',
}

export const routes: Routes = [
  {
    path: '',
    canActivate: [configGuard],
    children: [
      { path: ROUTES.COLLECTIONS, component: CollectionsScreen },
      { path: ROUTES.ENTITIES, component: EntitiesScreen },
      { path: `${ROUTES.ENTITY}/:id`, redirectTo: '' },
      { path: `${ROUTES.COLLECTION}/:id`, redirectTo: '' },
    ],
  },
  { path: 'error', component: ErrorScreen },
];
