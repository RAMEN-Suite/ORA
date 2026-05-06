import neo4j, { QueryResult, Record as Neo4jRecord } from 'neo4j-driver';
import { Neo4jService } from '../services/Neo4jService';
import { Listable } from '../models/List';
import { QueryParser, QueryPath } from '../utils/QueryParser';
import { ActiveFilter, EqualFilter, FacetGroup, FacetOptions, FacetValue } from '../models/Facet';
import { CypherPathHelper } from '../utils/CypherHelper';

export class FacetDAO {
  public static async getFacets(resource: Listable, label: string | undefined, options: FacetOptions): Promise<FacetGroup[]> {
    const groups: FacetGroup[] = [];

    for (const field of options.facets) {
      const values: FacetValue[] = await this.getFacetValues(resource, label, field, options);
      groups.push({ field, values });
    }

    return groups;
  }

  private static async getFacetValues(
    resource: Listable,
    label: string | undefined,
    field: string,
    options: FacetOptions,
  ): Promise<FacetValue[]> {
    const params: Record<string, unknown> = {};
    const query: string[] = this.getBaseMatch(resource, label, params);
    const conditions: string[] = [];

    this.applySearch(query, params, conditions, options);
    this.applyFilters(query, params, conditions, options, field);
    this.applyWhere(query, conditions);
    this.applyFacet(query, params, field);

    const result: QueryResult | null = await Neo4jService.run(query.join(' '), params);
    const values: FacetValue[] = this.mapFacetValues(result);

    return this.includeActiveValues(field, values, options.filters ?? []);
  }

  private static includeActiveValues(field: string, values: FacetValue[], filters: ActiveFilter[]): FacetValue[] {
    const existing: Set<string> = new Set(values.map((value: FacetValue): string => value.value));

    const missing: FacetValue[] = filters
      .filter((filter: ActiveFilter): filter is EqualFilter => filter.kind === 'equal')
      .filter((filter: EqualFilter): boolean => filter.field === field)
      .filter((filter: EqualFilter): boolean => !existing.has(filter.value))
      .map(
        (filter: EqualFilter): FacetValue => ({
          value: filter.value,
          count: 0,
        }),
      );

    return [...missing, ...values];
  }

  private static getBaseMatch(resource: Listable, label: string | undefined, params: Record<string, unknown>): string[] {
    params.resource = resource;
    if (!label) return [`MATCH (r:$($resource))`];

    params.label = label;
    return [`MATCH (r:$($resource):$($label))`];
  }

  private static applySearch(
    query: string[],
    params: Record<string, unknown>,
    conditions: string[],
    options: FacetOptions,
  ): void {
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
    options: FacetOptions,
    field: string,
  ): void {
    const filters: ActiveFilter[] = options.filters?.filter((filter: ActiveFilter): boolean => filter.field !== field) ?? [];
    const groups: Map<string, ActiveFilter[]> = this.groupFilters(filters);

    Array.from(groups.entries()).forEach(([_, group]: [string, ActiveFilter[]], groupIndex: number): void => {
      const groupConditions: string[] = [];

      group.forEach((filter: ActiveFilter, filterIndex: number): void => {
        const path: QueryPath = QueryParser.parse(filter.field);
        CypherPathHelper.filter(query, params, groupConditions, path, `filter${groupIndex}_${filterIndex}`, filter);
      });

      if (groupConditions.length > 0) conditions.push(`(${groupConditions.join(' OR ')})`);
    });
  }

  private static groupFilters(filters: ActiveFilter[]): Map<string, ActiveFilter[]> {
    const groups: Map<string, ActiveFilter[]> = new Map();

    filters.forEach((filter: ActiveFilter): void => {
      groups.set(filter.field, [...(groups.get(filter.field) ?? []), filter]);
    });

    return groups;
  }

  private static applyWhere(query: string[], conditions: string[]): void {
    if (conditions.length > 0) query.push(`WHERE ${conditions.join(' AND ')}`);
  }

  private static applyFacet(query: string[], params: Record<string, unknown>, field: string): void {
    const path: QueryPath = QueryParser.parse(field);

    query.push(...CypherPathHelper.matches(path, 'facet', params));

    const expression: string = CypherPathHelper.expression(path, 'facet', params);

    query.push(`WITH ${expression} AS value, r`);
    query.push(`WHERE value IS NOT NULL`);
    query.push(`RETURN value, count(DISTINCT r) AS count`);
    query.push(`ORDER BY count DESC, value ASC`);
  }

  private static mapFacetValues(result: QueryResult | null): FacetValue[] {
    return result?.records.map((record: Neo4jRecord): FacetValue => this.mapFacetValue(record)) ?? [];
  }

  private static mapFacetValue(record: Neo4jRecord): FacetValue {
    const value: unknown = record.get('value');
    const count: unknown = record.get('count');
    return { value: String(value), count: neo4j.isInt(count) ? count.toNumber() : Number(count) };
  }
}
