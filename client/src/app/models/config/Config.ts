import { ListViews } from './ListViews';
import { DetailViews } from './DetailViews';
import { IndexOptions } from './IndexOptions';
import { Annotations } from './Annotations';
import { SiteOptions } from './SiteOptions';

export type BindingPath = string;
export type TemplateValue = Binding | string;

export interface Config {
  site: SiteOptions;

  details: DetailViews;
  annotations: Annotations;

  lists: ListViews;
  indexes: IndexOptions;
}

export interface Binding {
  path: BindingPath;
  valueMap?: Record<string, unknown>;
}

export interface Template {
  template: string;
  values?: Record<string, TemplateValue>;
}
