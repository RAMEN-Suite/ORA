import { Routes } from '@angular/router';
import { EntitiesScreen } from './view/pages/entities-screen/entities.screen';
import { EntityScreen } from './view/pages/entity-screen/entity.screen';

export const routes: Routes = [
  { path: 'entities', component: EntitiesScreen },
  { path: 'entity/:id', component: EntityScreen },
];
