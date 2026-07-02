import { QueryResult } from 'neo4j-driver';
import { Neo4jService } from '../services/Neo4jService';
import { ListOptions } from '../models/List';
import { BuiltQuery, QueryAssembler } from './cypher/QueryAssembler';
import { CypherUtils } from '../utils/CypherUtils';
import { Utils } from '../utils/Utils';
import { RESOURCE } from '../constants/RESOURCE';

export class ListDAO {
  public static async getList(resource: RESOURCE, label: string | undefined, options: ListOptions): Promise<unknown[]> {
    const assembler: QueryAssembler = new QueryAssembler(resource, label);

    assembler.search(options.field, options.search);
    assembler.filters(options.filters ?? []);
    assembler.where();
    assembler.sort(options.orderBy);
    assembler.skip(options.skip);
    assembler.limit(options.limit);

    const alias: string = assembler.getAlias();
    assembler.append(`RETURN collect(DISTINCT ${alias} {.*, _labels: labels(${alias})}) AS resource`);

    const query: BuiltQuery = assembler.build();
    const result: QueryResult | null = await Neo4jService.run(query.cypher, query.params);
    const value: unknown = result?.records[0]?.get('resource');

    return Utils.parseArray(value);
  }

  public static async getCount(resource: RESOURCE, label: string | undefined, options: ListOptions): Promise<number> {
    const assembler: QueryAssembler = new QueryAssembler(resource, label);

    assembler.search(options.field, options.search);
    assembler.filters(options.filters ?? []);
    assembler.where();

    const alias: string = assembler.getAlias();
    assembler.append(`RETURN count(DISTINCT ${alias}) AS total`);

    const query: BuiltQuery = assembler.build();
    const result: QueryResult | null = await Neo4jService.run(query.cypher, query.params);
    const value: unknown = result?.records[0]?.get('total');

    return CypherUtils.parseNumber(value);
  }
}
