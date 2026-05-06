export type ActiveFilter = EqualFilter | RangeFilter;

export interface EqualFilter {
  kind: 'equal';
  field: string;
  value: string;
}

export interface RangeFilter {
  kind: 'range';
  field: string;
  min?: number;
  max?: number;
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface FacetGroup {
  field: string;
  values: FacetValue[];
}

export interface FacetOptions {
  search?: string;
  facets: string[];
  filters?: ActiveFilter[];
}
