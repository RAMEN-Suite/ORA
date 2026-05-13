import { QueryResult } from 'neo4j-driver';
import { Neo4jService } from '../services/Neo4jService';
import { Listable, ListOptions } from '../models/List';
import { CypherQueryHelper, QueryContext } from '../helper/CypherQueryHelper';
import { Utils } from '../utils/Utils';

export class ListDAO {
  public static async getList<T>(listable: Listable, label: string | undefined, options: ListOptions): Promise<T[]> {
    const context: QueryContext = CypherQueryHelper.createContext(listable, label);

    CypherQueryHelper.applySearch(context, options.field, options.search);
    CypherQueryHelper.applyFilter(context, options.filters ?? []);
    CypherQueryHelper.applyWhere(context);
    CypherQueryHelper.applySorting(context, options.orderBy, options.asc);
    CypherQueryHelper.applySkip(context, options.skip);
    CypherQueryHelper.applyLimit(context, options.limit);

    context.query.push(`RETURN collect(DISTINCT r {.*, _types: labels(r)}) AS resource`);

    const result: QueryResult | null = await Neo4jService.run(context.query.join(' '), context.params);
    const resource: unknown = result?.records[0]?.get('resource');
    return Array.isArray(resource) ? (resource as T[]) : [];
  }

  public static async getCount(resource: Listable, label: string | undefined, options: ListOptions): Promise<number> {
    const context: QueryContext = CypherQueryHelper.createContext(resource, label);

    CypherQueryHelper.applySearch(context, options.field, options.search);
    CypherQueryHelper.applyFilter(context, options.filters ?? []);
    CypherQueryHelper.applyWhere(context);

    context.query.push(`RETURN count(DISTINCT r) AS total`);

    const result: QueryResult | null = await Neo4jService.run(context.query.join(' '), context.params);
    const total: unknown = result?.records[0]?.get('total');
    return Utils.parseNumber(total) ?? 0;
  }
}
