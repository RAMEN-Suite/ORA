import { Nullable } from '../types/global';
import neo4j, { QueryResult } from 'neo4j-driver';
import { Neo4jService } from '../services/Neo4jService';

export enum Listable {
  COLLECTION = 'Collection',
  ENTITY = 'Entity',
  CONTENT = 'Content',
}

export interface ListOptions {
  limit: number;
  skip: number;
  orderBy?: string;
  asc?: boolean;
  search?: string;
  field?: string;
}

export class ListDAO {
  public static async getList<T>(resource: Listable, label: Nullable<string>, options: ListOptions): Promise<T[]> {
    const query: string[] = label ? [`MATCH (r:${resource}:${label})`] : [`MATCH (r:${resource})`];
    const params: Partial<Record<keyof Partial<Pick<ListOptions, 'skip' | 'limit' | 'search'>>, unknown>> = {};

    if (options.search) {
      const field: string = options.field ?? 'label';
      query.push(this.getSearchQuery(field));
      params.search = options.search;
    }

    if (options.orderBy !== undefined) {
      const direction: string = options.asc === false ? 'DESC' : 'ASC';
      query.push(`ORDER BY r.${options.orderBy} ${direction}`);
    }

    if (options.skip > 0) {
      query.push(`SKIP $skip`);
      params.skip = neo4j.int(options.skip);
    }

    if (options.limit > 0) {
      query.push(`LIMIT $limit`);
      params.limit = neo4j.int(options.limit);
    }

    query.push(`RETURN collect(r {.*, _types: labels(r)}) as resource`);
    const result: Nullable<QueryResult> = await Neo4jService.run(query.join(' '), params);
    return result?.records[0]?.get('resource') ?? [];
  }

  public static async getCount(resource: Listable, label: Nullable<string>, options: ListOptions): Promise<number> {
    const query: string[] = label ? [`MATCH (r:${resource}:${label})`] : [`MATCH (r:${resource})`];
    const params: Partial<Pick<ListOptions, 'search'>> = {};

    if (options.search) {
      const field: string = options.field ?? 'label';
      query.push(this.getSearchQuery(field));
      params.search = options.search;
    }

    query.push(`RETURN count(r) as total`);
    const result: Nullable<QueryResult> = await Neo4jService.run(query.join(' '), params);
    return result?.records[0]?.get('total') ?? 0;
  }

  private static getSearchQuery(field: string): string {
    return `WHERE toLower(r.${field}) CONTAINS toLower($search)`;
  }
}
