export type Filter = EqualFilter | RangeFilter;

export interface EqualFilter {
  kind: "equal";
  field: string;
  value: string;
}

export interface RangeFilter {
  kind: "range";
  field: string;
  min?: number;
  max?: number;
}
