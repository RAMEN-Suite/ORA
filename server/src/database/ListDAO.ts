import { QueryResult } from 'neo4j-driver';
import { Neo4jService } from '../services/Neo4jService';
import { Listable, ListOptions } from '../models/List';
import { CypherQueryHelper, QueryContext } from '../helper/CypherQueryHelper';

export class ListDAO {
  public static async getList<T>(resource: Listable, label: string | undefined, options: ListOptions): Promise<T[]> {
    const context: QueryContext = CypherQueryHelper.createContext(resource, label);

    CypherQueryHelper.applySearch(context, options.field, options.search);
    CypherQueryHelper.applyFilter(context, options.filters ?? []);
    CypherQueryHelper.applyWhere(context);
    CypherQueryHelper.applySorting(context, options.orderBy, options.asc);
    CypherQueryHelper.applySkip(context, options.skip);
    CypherQueryHelper.applyLimit(context, options.limit);

    context.query.push(`RETURN collect(DISTINCT r {.*, _types: labels(r)}) AS resource`);

    const result: QueryResult | null = await Neo4jService.run(context.query.join(' '), context.params);
    return result?.records[0]?.get('resource') ?? [];
  }

  public static async getCount(resource: Listable, label: string | undefined, options: ListOptions): Promise<number> {
    const context: QueryContext = CypherQueryHelper.createContext(resource, label);

    CypherQueryHelper.applySearch(context, options.field, options.search);
    CypherQueryHelper.applyFilter(context, options.filters ?? []);
    CypherQueryHelper.applyWhere(context);

    context.query.push(`RETURN count(DISTINCT r) AS total`);

    const result: QueryResult | null = await Neo4jService.run(context.query.join(' '), context.params);
    return result?.records[0]?.get('total') ?? 0;
  }
}
