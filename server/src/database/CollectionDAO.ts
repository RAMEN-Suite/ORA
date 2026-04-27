import { Nullable } from '../types/global';
import { QueryResult } from 'neo4j-driver';
import { Neo4jService } from '../services/Neo4jService';
import { Options } from '../models/utility/Options';
import { CypherUtils } from '../utils/CypherUtils';
import { Collection } from '../models/RAMEN';

export class CollectionDAO {
  public static async getCollections(label: Nullable<string>, options: Options): Promise<Collection[]> {
    const query: string[] = label ? [`MATCH (c:Collection:${label})`] : [`MATCH (c:Collection)`];
    query.push(CypherUtils.getListQuery('c', options));
    query.push(`RETURN collect(apoc.map.merge(properties(c), {_types: labels(c)})) as collections`);

    const result: Nullable<QueryResult> = await Neo4jService.run(query.join(' '));
    return result?.records[0]?.get('collections') ?? [];
  }
}
