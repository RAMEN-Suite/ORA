import { SearchableOption } from '../view/shared/searchable-list/searchable-list.component';

export const UNKNOWN_INDEX_VALUE = '#';
export type ListIndexType = 'character' | 'alias-list' | 'bible';

export interface ListIndex {
  readonly type: ListIndexType;
  options(labels: string[]): SearchableOption[];
  value(label: string): string;
  compare(a: string, b: string): number;
}

export interface AliasOption extends SearchableOption {
  order: number;
  aliases: string[];
}

export interface AliasMatch {
  option: AliasOption;
  rest: string;
}
