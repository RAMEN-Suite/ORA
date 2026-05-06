import { QueryResult, Record } from 'neo4j-driver';
import { Neo4jService } from '../services/Neo4jService';
import { Listable } from '../models/List';
import { AccessParser, AccessPath } from '../helper/parser/AccessParser';
import { ActiveFilter, FacetGroup, FacetOptions, FacetValue } from '../models/Facet';
import { CypherAccessHelper } from '../helper/CypherAccessHelper';
import { CypherQueryHelper, QueryContext } from '../helper/CypherQueryHelper';

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
    facet: string,
    options: FacetOptions,
  ): Promise<FacetValue[]> {
    const context: QueryContext = CypherQueryHelper.createContext(resource, label);

    CypherQueryHelper.applySearch(context, options.field, options.search);
    CypherQueryHelper.applyFilter(context, options.filters ?? [], facet);
    CypherQueryHelper.applyWhere(context);

    this.applyFacet(context, facet);

    const result: QueryResult | null = await Neo4jService.run(context.query.join(' '), context.params);
    const values: FacetValue[] = this.mapFacetValues(result);

    return this.includeActiveValues(facet, values, options.filters ?? []);
  }

  private static applyFacet(context: QueryContext, field: string): void {
    const prefix = 'facet';
    const path: AccessPath = AccessParser.parse(field);

    context.query.push(`WITH DISTINCT r`);
    context.query.push(...CypherAccessHelper.matches(path, prefix, context.params));
    const expression: string = CypherAccessHelper.expression(path, prefix, context.params);

    context.query.push(`WITH ${expression} AS value, r`);
    context.query.push(`WHERE value IS NOT NULL`);
    context.query.push(`RETURN value, count(DISTINCT r) AS count`);
    context.query.push(`ORDER BY count DESC, value ASC`);
  }

  private static includeActiveValues(field: string, values: FacetValue[], filters: ActiveFilter[]): FacetValue[] {
    const existing = new Set(values.map((value: FacetValue): string => value.value));

    const missing: string[] = filters
      .flatMap((filter: ActiveFilter): string[] => this.getActiveFacetValue(field, filter))
      .filter((value: string): boolean => !existing.has(value));

    return [...missing.map((value: string): FacetValue => ({ value, count: 0 })), ...values];
  }

  private static getActiveFacetValue(field: string, filter: ActiveFilter): string[] {
    if (filter.kind !== 'equal') return [];
    if (filter.field !== field) return [];
    return [filter.value];
  }

  private static mapFacetValues(result: QueryResult | null): FacetValue[] {
    return (
      result?.records.map(
        (record: Record): FacetValue => ({
          value: String(record.get('value')),
          count: record.get('count') ?? 0,
        }),
      ) ?? []
    );
  }
}
