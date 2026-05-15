import { Node } from "../models/RAMEN";
import { QueryResult, Record as Neo4jRecord } from "neo4j-driver";
import { Neo4jService } from "../services/Neo4jService";
import { AccessParser, AccessPath } from "../parser/AccessParser";
import { AccessPattern } from "./cypher/AccessPattern";

export class ViewDAO {
  private static alias: string = "r";

  public static async fetchNode(uuid: string): Promise<Node | null> {
    const query: string = `
      MATCH (${this.alias} { uuid: $uuid })
      RETURN ${this.alias} {.*, _labels: labels(${this.alias})} AS resource
      LIMIT 1
    `;

    const result: QueryResult | null = await Neo4jService.run(query, { uuid });
    const record: Neo4jRecord | undefined = result?.records[0];
    if (!record) return null;

    const resource: unknown = record.get("resource");
    return this.isNode(resource) ? resource : null;
  }

  public static async fetchValues(uuid: string, paths: string[]): Promise<Record<string, unknown>> {
    const values: Record<string, unknown> = {};

    for (const field of paths) {
      const params: Record<string, unknown> = { uuid };
      const path: AccessPath = AccessParser.parse(field);
      const pattern: AccessPattern = new AccessPattern(path, this.alias, "value", params);

      const query: string = [
        `MATCH (${this.alias} { uuid: $uuid })`,
        ...pattern.match(),
        `WITH ${pattern.expression()} AS value`,
        "WHERE value IS NOT NULL",
        "RETURN collect(DISTINCT value) AS values",
      ].join(" ");

      const result: QueryResult | null = await Neo4jService.run(query, params);
      const record: Neo4jRecord | undefined = result?.records[0];
      const collected: unknown = record?.get("values");

      if (!Array.isArray(collected) || collected.length === 0) {
        values[field] = undefined;
        continue;
      }

      values[field] = collected.length === 1 ? collected[0] : collected;
    }

    return values;
  }

  private static isNode(value: unknown): value is Node {
    if (typeof value !== "object" || value === null) return false;
    if (!("_labels" in value) || !("uuid" in value)) return false;
    return Array.isArray(value._labels) && typeof value.uuid === "string";
  }
}
