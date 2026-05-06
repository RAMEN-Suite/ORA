import neo4j, { QueryResult, Record as Neo4jRecord } from 'neo4j-driver';
import { Neo4jService } from '../services/Neo4jService';
import { Listable } from '../models/List';
import { QueryParser, QueryPath } from '../utils/QueryParser';
import { FacetGroup, FacetOptions, FacetValue } from '../models/Facet';
import { CypherPathHelper } from '../utils/CypherHelper';

export class FacetDAO {
  public static async getFacets(resource: Listable, label: string | undefined, options: FacetOptions): Promise<FacetGroup[]> {
    const groups: FacetGroup[] = [];

    for (const field of options.filters) {
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

    this.applySearch(query, params, options);
    this.applyFacet(query, params, field);

    const result: QueryResult | null = await Neo4jService.run(query.join(' '), params);
    return this.mapFacetValues(result);
  }

  private static getBaseMatch(resource: Listable, label: string | undefined, params: Record<string, unknown>): string[] {
    params.resource = resource;
    if (!label) return [`MATCH (r:$($resource))`];

    params.label = label;
    return [`MATCH (r:$($resource):$($label))`];
  }

  private static applySearch(query: string[], params: Record<string, unknown>, options: FacetOptions): void {
    if (!options.search) return;

    const path: QueryPath = QueryParser.parse(options.field ?? 'label');
    query.push(...CypherPathHelper.matches(path, 'search', params));

    const expression: string = CypherPathHelper.expression(path, 'search', params);
    query.push(`WHERE apoc.text.clean(${expression}) CONTAINS apoc.text.clean($search)`);

    params.search = options.search;
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
