import { ActiveFilter } from './Facet';

export enum Listable {
  COLLECTION = 'Collection',
  ENTITY = 'Entity',
}

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
  orderBy?: string;
  asc?: boolean;
  search?: string;
  filters?: ActiveFilter[];
}
