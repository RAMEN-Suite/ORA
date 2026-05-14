import { QueryResult, Record as Neo4jRecord } from "neo4j-driver";
import { Neo4jService } from "../services/Neo4jService";
import { AccessParser, AccessPath } from "../parser/AccessParser";
import { FacetGroup, FacetOptions, FacetValue } from "../models/Facet";
import { QueryAccessBuilder } from "./cypher/QueryAccessBuilder";
import { BuiltQuery, QueryBuilder } from "./cypher/QueryBuilder";
import { Utils } from "../utils/Utils";
import { CypherUtils } from "../utils/CypherUtils";
import { Resource } from "../models/RAMEN";

export class FacetDAO {
  public static async getFacets(listable: Resource, label: string | undefined, options: FacetOptions): Promise<FacetGroup[]> {
    const groups: FacetGroup[] = [];

    for (const field of options.facets) {
      const values: FacetValue[] = await this.getValues(listable, label, field, options);
      groups.push({ field, values });
    }

    return groups;
  }

  private static async getValues(
    resource: Resource,
    label: string | undefined,
    facet: string,
    options: FacetOptions,
  ): Promise<FacetValue[]> {
    const builder: QueryBuilder = new QueryBuilder(resource, label);

    builder.search(options.field, options.search);
    builder.filters(options.filters ?? []);
    builder.where();

    this.applyFacet(builder, facet);

    const query: BuiltQuery = builder.build();
    const result: QueryResult | null = await Neo4jService.run(query.cypher, query.params);
    return this.mapFacetValues(result);
  }

  private static applyFacet(builder: QueryBuilder, field: string): void {
    const prefix = "facet";
    const path: AccessPath = AccessParser.parse(field);
    const params: Record<string, unknown> = builder.parameters();

    builder.append("WITH DISTINCT r");
    builder.append(...QueryAccessBuilder.matches(path, prefix, params));

    const expression: string = QueryAccessBuilder.expression(path, prefix, params);
    builder.append(`WITH ${expression} AS value, r`);
    builder.append("WHERE value IS NOT NULL");
    builder.append("RETURN value, count(DISTINCT r) AS count");
    builder.append("ORDER BY count DESC, value ASC");
  }

  private static mapFacetValues(result: QueryResult | null): FacetValue[] {
    if (!result) return [];

    return result.records.map((record: Neo4jRecord): FacetValue => {
      const value: unknown = record.get("value");
      const count: unknown = record.get("count");
      return { value: Utils.parseString(value) ?? "", count: CypherUtils.parseNumber(count) };
    });
  }
}
