import { QueryResult, Record } from "neo4j-driver";
import { Neo4jService } from "../services/Neo4jService";
import { Listable } from "../models/List";
import { AccessParser, AccessPath } from "../helper/parser/AccessParser";
import { FacetGroup, FacetOptions, FacetValue } from "../models/Facet";
import { CypherAccessHelper } from "../helper/CypherAccessHelper";
import { CypherQueryHelper, QueryContext } from "../helper/CypherQueryHelper";
import { Utils } from "../utils/Utils";

export class FacetDAO {
  public static async getFacets(listable: Listable, label: string | undefined, options: FacetOptions): Promise<FacetGroup[]> {
    const groups: FacetGroup[] = [];

    for (const field of options.facets) {
      const values: FacetValue[] = await this.getFacetValues(listable, label, field, options);
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
    CypherQueryHelper.applyFilter(context, options.filters ?? []);
    CypherQueryHelper.applyWhere(context);

    this.applyFacet(context, facet);

    const result: QueryResult | null = await Neo4jService.run(context.query.join(" "), context.params);
    return this.mapFacetValues(result);
  }

  private static applyFacet(context: QueryContext, field: string): void {
    const prefix = "facet";
    const path: AccessPath = AccessParser.parse(field);

    context.query.push(`WITH DISTINCT r`);
    context.query.push(...CypherAccessHelper.matches(path, prefix, context.params));
    const expression: string = CypherAccessHelper.expression(path, prefix, context.params);

    context.query.push(`WITH ${expression} AS value, r`);
    context.query.push(`WHERE value IS NOT NULL`);
    context.query.push(`RETURN value, count(DISTINCT r) AS count`);
    context.query.push(`ORDER BY count DESC, value ASC`);
  }

  private static mapFacetValues(result: QueryResult | null): FacetValue[] {
    if (!result) return [];

    return result.records.map((record: Record): FacetValue => {
      const value: unknown = record.get("value");
      const count: unknown = record.get("count");
      return { value: Utils.parseString(value) ?? "", count: Utils.parseNumber(count) ?? 0 };
    });
  }
}
