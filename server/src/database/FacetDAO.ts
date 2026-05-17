import { QueryResult, Record as Neo4jRecord } from "neo4j-driver";
import { Neo4jService } from "../services/Neo4jService";
import { FacetGroup, FacetOptions, FacetValue } from "../models/Facet";
import { AccessPattern } from "./cypher/AccessPattern";
import { BuiltQuery, QueryAssembler } from "./cypher/QueryAssembler";
import { Utils } from "../utils/Utils";
import { CypherUtils } from "../utils/CypherUtils";
import { Resource } from "../models/Node";

export class FacetDAO {
  public static async getFacets(resource: Resource, label: string | undefined, options: FacetOptions): Promise<FacetGroup[]> {
    const groups: FacetGroup[] = [];

    for (const field of options.facets) {
      const values: FacetValue[] = await this.getValues(resource, label, field, options);
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
    const assembler: QueryAssembler = new QueryAssembler(resource, label);

    assembler.search(options.field, options.search);
    assembler.filters(options.filters ?? []);
    assembler.where();

    this.applyFacet(assembler, facet);
    const query: BuiltQuery = assembler.build();
    const result: QueryResult | null = await Neo4jService.run(query.cypher, query.params);

    return this.mapFacetValues(result);
  }

  private static applyFacet(assembler: QueryAssembler, field: string): void {
    const alias: string = assembler.getAlias();
    const pattern: AccessPattern = assembler.access(field, "facet");

    assembler.append(`WITH DISTINCT ${alias}`);
    assembler.append(...pattern.match());

    const expression: string = pattern.expression();
    assembler.append(`WITH ${expression} AS value, ${alias}`);
    assembler.append("WHERE value IS NOT NULL");
    assembler.append(`RETURN value, count(DISTINCT ${alias}) AS count`);
    assembler.append("ORDER BY count DESC, value ASC");
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
