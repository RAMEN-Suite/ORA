import { ListViews } from './ListViews';
import { DetailViews } from './DetailViews';
import { Features } from './Features';

export type BindingPath = string;

export interface Config {
  lists: ListViews;
  details: DetailViews;
  features: Features;
}

export interface Binding {
  path: BindingPath;
}
