import { Filter } from './Filter';

export interface List<T> {
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  skip: number;
  limit: number;
  count: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ListOptions {
  limit: number;
  skip: number;
  orderBy?: SortField[];
  search?: string;
  field?: string;
  filters?: Filter[];
}

export interface SortField {
  field: string;
  asc: boolean;
}
