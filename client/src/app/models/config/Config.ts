import { ListViews } from './ListViews';
import { DetailViews } from './DetailViews';
import { FeatureOptions } from './FeatureOptions';
import { Annotations } from './Annotations';
import { SiteOptions } from './SiteOptions';

export type BindingPath = string;

export interface Config {
  site: SiteOptions;
  lists: ListViews;
  details: DetailViews;
  annotations: Annotations;
  features: FeatureOptions;
}

export interface Binding {
  path: BindingPath;
  valueMap?: Record<string, unknown>;
}
