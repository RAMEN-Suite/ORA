import { AccessParser, AccessPath } from "./parser/AccessParser";
import { CypherAccessHelper } from "./CypherAccessHelper";
import { ActiveFilter } from "../models/Facet";
import neo4j from "neo4j-driver";
import { CypherFilterHelper } from "./CypherFilterHelper";

export interface QueryContext {
  query: string[];
  params: Record<string, unknown>;
  conditions: string[];
}

export class CypherQueryHelper {
  public static createContext(resource: string, label?: string): QueryContext {
    const params: Record<string, unknown> = {};
    const query: string[] = this.getBaseMatch(resource, label, params);
    return { query, params, conditions: [] };
  }

  public static applySearch(context: QueryContext, field: string | undefined, search: string | undefined): void {
    if (!search) return;
    const prefix = "search";

    const path: AccessPath = AccessParser.parse(field ?? "label");
    context.query.push(...CypherAccessHelper.matches(path, prefix, context.params));

    const property: string = CypherAccessHelper.expression(path, prefix, context.params);
    context.conditions.push(`apoc.text.clean(${property}) CONTAINS apoc.text.clean($search)`);

    context.params.search = search;
  }

  public static applyFilter(context: QueryContext, filters: ActiveFilter[]): void {
    for (const [index, filter] of filters.entries()) {
      const path: AccessPath = AccessParser.parse(filter.field);
      CypherFilterHelper.filter(path, context.query, context.conditions, context.params, `filter${String(index)}`, filter);
    }
  }

  public static applySorting(context: QueryContext, field: string | undefined, asc: boolean | undefined): void {
    if (!field) return;

    const prefix = "sort";
    const path: AccessPath = AccessParser.parse(field);
    const direction: string = asc === false ? "DESC" : "ASC";

    context.query.push(...CypherAccessHelper.matches(path, prefix, context.params));
    context.query.push(`ORDER BY ${CypherAccessHelper.expression(path, prefix, context.params)} ${direction}`);
  }

  public static applySkip(context: QueryContext, skip: number | undefined): void {
    if (!skip || skip <= 0) return;
    context.query.push(`SKIP $skip`);
    context.params.skip = neo4j.int(skip);
  }

  public static applyLimit(context: QueryContext, limit: number | undefined): void {
    if (!limit || limit <= 0) return;
    context.query.push(`LIMIT $limit`);
    context.params.limit = neo4j.int(limit);
  }

  public static applyWhere(context: QueryContext): void {
    if (context.conditions.length > 0) context.query.push(`WHERE ${context.conditions.join(" AND ")}`);
  }

  private static getBaseMatch(resource: string, label: string | undefined, params: Record<string, unknown>): string[] {
    params.resource = resource;
    if (!label) return [`MATCH (r:$($resource))`];

    params.label = label;
    return [`MATCH (r:$($resource):$($label))`];
  }
}
