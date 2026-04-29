import { Routes } from '@angular/router';
import { EntitiesScreen } from './view/pages/entities-screen/entities.screen';
import { CollectionsScreen } from './view/pages/collections-screen/collections.screen';
import { configGuard } from './guards/config.guard';
import { ErrorScreen } from './view/pages/error-screen/error.screen';

export const routes: Routes = [
  {
    path: '',
    canActivate: [configGuard],
    children: [
      { path: 'collections', component: CollectionsScreen },
      { path: 'entities', component: EntitiesScreen },
    ],
  },
  { path: 'error', component: ErrorScreen },
];
