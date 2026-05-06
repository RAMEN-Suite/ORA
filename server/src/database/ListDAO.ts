import neo4j, { QueryResult } from 'neo4j-driver';
import { Neo4jService } from '../services/Neo4jService';
import { ActiveFilter } from '../models/Facet';
import { Listable, ListOptions } from '../models/List';
import { CypherPathHelper } from '../utils/CypherHelper';
import { QueryParser, QueryPath } from '../utils/QueryParser';

export class ListDAO {
  public static async getList<T>(resource: Listable, label: string | undefined, options: ListOptions): Promise<T[]> {
    const params: Record<string, unknown> = {};
    const query: string[] = this.getBaseMatch(resource, label, params);

    const conditions: string[] = [];

    this.applySearch(query, params, conditions, options);
    this.applyFilters(query, params, conditions, options);
    this.applyWhere(query, conditions);
    this.applySorting(query, params, options);
    this.applyPagination(query, params, options);

    query.push(`RETURN collect(DISTINCT r {.*, _types: labels(r)}) AS resource`);

    const result: QueryResult | null = await Neo4jService.run(query.join(' '), params);
    return result?.records[0]?.get('resource') ?? [];
  }

  public static async getCount(resource: Listable, label: string | undefined, options: ListOptions): Promise<number> {
    const params: Record<string, unknown> = {};
    const query: string[] = this.getBaseMatch(resource, label, params);

    const conditions: string[] = [];

    this.applySearch(query, params, conditions, options);
    this.applyFilters(query, params, conditions, options);
    this.applyWhere(query, conditions);

    query.push(`RETURN count(DISTINCT r) AS total`);

    const result: QueryResult | null = await Neo4jService.run(query.join(' '), params);
    const total: unknown = result?.records[0]?.get('total');

    return neo4j.isInt(total) ? total.toNumber() : Number(total ?? 0);
  }

  private static getBaseMatch(resource: Listable, label: string | undefined, params: Record<string, unknown>): string[] {
    params.resource = resource;
    if (!label) return [`MATCH (r:$($resource))`];

    params.label = label;
    return [`MATCH (r:$($resource):$($label))`];
  }

  private static applySearch(query: string[], params: Record<string, unknown>, conditions: string[], options: ListOptions): void {
    if (!options.search) return;
    const path: QueryPath = QueryParser.parse('label');

    query.push(...CypherPathHelper.matches(path, 'search', params));
    conditions.push(`apoc.text.clean(${CypherPathHelper.expression(path, 'search', params)}) CONTAINS apoc.text.clean($search)`);

    params.search = options.search;
  }

  private static applyFilters(
    query: string[],
    params: Record<string, unknown>,
    conditions: string[],
    options: ListOptions,
  ): void {
    const groups: Map<string, ActiveFilter[]> = new Map();

    options.filters?.forEach((filter: ActiveFilter): void => {
      groups.set(filter.field, [...(groups.get(filter.field) ?? []), filter]);
    });

    Array.from(groups.entries()).forEach(([field, filters]: [string, ActiveFilter[]], groupIndex: number): void => {
      const groupConditions: string[] = [];

      filters.forEach((filter: ActiveFilter, index: number): void => {
        const path: QueryPath = QueryParser.parse(filter.field);
        CypherPathHelper.filter(query, params, groupConditions, path, `filter${groupIndex}_${index}`, filter);
      });

      conditions.push(`(${groupConditions.join(' OR ')})`);
    });
  }

  private static applyWhere(query: string[], conditions: string[]): void {
    if (conditions.length > 0) query.push(`WHERE ${conditions.join(' AND ')}`);
  }

  private static applySorting(query: string[], params: Record<string, unknown>, options: ListOptions): void {
    if (!options.orderBy) return;

    const path: QueryPath = QueryParser.parse(options.orderBy);
    const direction: string = options.asc === false ? 'DESC' : 'ASC';

    query.push(...CypherPathHelper.matches(path, 'sort', params));
    query.push(`ORDER BY ${CypherPathHelper.expression(path, 'sort', params)} ${direction}`);
  }

  private static applyPagination(query: string[], params: Record<string, unknown>, options: ListOptions): void {
    if (options.skip > 0) {
      query.push(`SKIP $skip`);
      params.skip = neo4j.int(options.skip);
    }

    if (options.limit > 0) {
      query.push(`LIMIT $limit`);
      params.limit = neo4j.int(options.limit);
    }
  }
}
