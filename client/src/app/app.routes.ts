import { Routes } from '@angular/router';
import { EntitiesScreen } from './view/screens/entities-screen/entities.screen';
import { configGuard } from './guards/config.guard';
import { ErrorScreen } from './view/screens/error-screen/error.screen';
import { CollectionScreen } from './view/screens/collection-screen/collection.screen';
import { CollectionsScreen } from './view/screens/collections-screen/collections.screen';
import { EntityScreen } from './view/screens/entity-screen/entity.screen';

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
      { path: `${ROUTES.ENTITY}/:id`, component: EntityScreen },
      { path: `${ROUTES.COLLECTION}/:id`, component: CollectionScreen },
    ],
  },
  { path: 'error', component: ErrorScreen },
];
