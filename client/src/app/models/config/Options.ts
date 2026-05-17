import { AccessPath } from './Access';

export type SortDirection = 'asc' | 'desc';
export type EntityIndex = 'character' | 'bible';

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

export interface FilterOption extends Option {
  display?: 'list' | 'range';
  value: AccessPath;
  valueMap?: Record<string, string>;
}

export interface SortOption extends Option {
  value: AccessPath;
}

export interface EntityOption extends Option {
  properties?: Property[];
  index?: EntityIndex;
}

export interface OptionGroup<TOption extends Option = Option> {
  initial: string;
  options: TOption[];
}

export interface SortOptionGroup extends OptionGroup<SortOption> {
  direction: SortDirection;
}

export interface Property {
  name: AccessPath;
  display?: string;
  valueMap?: Record<string, string>;
}
