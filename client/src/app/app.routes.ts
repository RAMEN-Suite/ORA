import { Routes } from '@angular/router';
import { EntitiesScreen } from './view/screens/entities-screen/entities.screen';
import { CollectionsScreen } from './view/screens/collections-screen/collections.screen';
import { configGuard } from './guards/config.guard';
import { ErrorScreen } from './view/screens/error-screen/error.screen';
import { ComposableScreen } from './view/screens/composable-screen/composable.screen';

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
      { path: `${ROUTES.COLLECTION}/:id`, component: ComposableScreen },
    ],
  },
  { path: 'error', component: ErrorScreen },
];
