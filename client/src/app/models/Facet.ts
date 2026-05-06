export interface FacetValue {
  value: string;
  count: number;
}

export interface FacetGroup {
  field: string;
  values: FacetValue[];
}

export interface FacetOptions {
  field?: string;
  search?: string;
  filters: string[];
}
