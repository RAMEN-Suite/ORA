import { ListViews } from './ListViews';
import { DetailViews } from './DetailViews';
import { Features } from './Features';
import { Annotations } from './Annotations';

export type BindingPath = string;

export interface Config {
  lists: ListViews;
  details: DetailViews;
  features: Features;
  annotations: Annotations;
}

export interface Binding {
  path: BindingPath;
  valueMap?: Record<string, unknown>;
}
