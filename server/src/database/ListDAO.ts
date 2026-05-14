import { QueryResult } from "neo4j-driver";
import { Neo4jService } from "../services/Neo4jService";
import { ListOptions } from "../models/List";
import { BuiltQuery, QueryBuilder } from "./cypher/QueryBuilder";
import { Resource } from "../models/RAMEN";
import { CypherUtils } from "../utils/CypherUtils";
import { Utils } from "../utils/Utils";

export class ListDAO {
  public static async getList(resource: Resource, label: string | undefined, options: ListOptions): Promise<unknown[]> {
    const builder: QueryBuilder = new QueryBuilder(resource, label);

    builder.search(options.field, options.search);
    builder.filters(options.filters ?? []);
    builder.where();
    builder.sort(options.orderBy, options.asc);
    builder.skip(options.skip);
    builder.limit(options.limit);
    builder.append("RETURN collect(DISTINCT r {.*, _labels: labels(r)}) AS resource");

    const query: BuiltQuery = builder.build();
    const result: QueryResult | null = await Neo4jService.run(query.cypher, query.params);
    const value: unknown = result?.records[0]?.get("resource");

    return Utils.parseArray(value);
  }

  public static async getCount(resource: Resource, label: string | undefined, options: ListOptions): Promise<number> {
    const builder: QueryBuilder = new QueryBuilder(resource, label);

    builder.search(options.field, options.search);
    builder.filters(options.filters ?? []);
    builder.where();
    builder.append("RETURN count(DISTINCT r) AS total");

    const query: BuiltQuery = builder.build();
    const result: QueryResult | null = await Neo4jService.run(query.cypher, query.params);
    const value: unknown = result?.records[0]?.get("total");

    return CypherUtils.parseNumber(value);
  }
}
