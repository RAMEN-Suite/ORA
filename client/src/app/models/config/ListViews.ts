import { BindingPath } from './Config';
import { ListIndexType } from './IndexOptions';

export interface ListViews {
  entities: ListView<EntityListOption>;
  collections: ListView;
}

export interface ListView<TOption extends Option = ListOption> {
  initial: string;
  options: TOption[];
  properties?: Property[];
}

export type SortDirection = 'asc' | 'desc';

export interface Option {
  icon?: string;
  label: string;
  value: string;
}

export interface ListOption extends Option {
  properties?: Property[];
  sort?: SortOptionGroup;
  filters?: FilterOption[];
}

export interface EntityListOption extends ListOption {
  properties?: Property[];
  index?: ListIndexType;
}

export interface FilterOption extends Option {
  display?: 'list' | 'range';
  value: BindingPath;
  valueMap?: Record<string, string>;
}

export interface SortOption extends Option {
  value: BindingPath;
}

export interface OptionGroup<TOption extends Option = Option> {
  initial: string;
  options: TOption[];
}

export interface SortOptionGroup extends OptionGroup<SortOption> {
  direction: SortDirection;
}

export interface Property {
  name: BindingPath;
  display?: string;
  valueMap?: Record<string, string>;
}
