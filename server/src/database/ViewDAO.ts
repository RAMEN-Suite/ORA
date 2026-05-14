import { Node } from "../models/RAMEN";
import { QueryResult, Record as Neo4jRecord } from "neo4j-driver";
import { Neo4jService } from "../services/Neo4jService";

export class ViewDAO {
  public static async fetchNode(uuid: string): Promise<Node | null> {
    const query: string = `MATCH (r { uuid: $uuid }) RETURN collect(DISTINCT r {.*, _types: labels(r)}) AS resource`;

    const result: QueryResult | null = await Neo4jService.run(query, { uuid });
    const record: Neo4jRecord | undefined = result?.records[0];
    if (!record) return null;

    const resource: unknown = record.get("resource");
    if (!this.isNode(resource)) return null;
    return resource;
  }

  private static isNode(value: unknown): value is Node {
    if (typeof value !== "object" || value === null) return false;
    if (!("_labels" in value) || !("uuid" in value)) return false;
    return Array.isArray(value._labels) && typeof value.uuid === "string";
  }
}
