import { Filter } from "./Filter";

export interface FacetGroup {
  field: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface FacetOptions {
  search?: string;
  field?: string;
  facets: string[];
  filters?: Filter[];
}
