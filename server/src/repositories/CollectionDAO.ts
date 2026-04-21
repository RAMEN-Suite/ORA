import { Collection } from '../models/ramen/Collection';
import { Nullable } from '../types/global';
import { QueryResult } from 'neo4j-driver';
import { Neo4jService } from '../services/Neo4jService';
import { ListOptions } from '../models/utility/Options';
import { CypherUtils } from '../utils/CypherUtils';

export class CollectionDAO {
  public static async getCollections(label: Nullable<string>, options: ListOptions): Promise<Collection[]> {
    const query: string[] = label ? [`MATCH (c:Collection:${label})`] : [`MATCH (c:Collection)`];
    query.push(CypherUtils.getListQuery('c', options));
    query.push(`RETURN collect(properties(c)) as collections`);

    const result: Nullable<QueryResult> = await Neo4jService.run(query.join(' '));
    return result?.records[0]?.get('collections') ?? [];
  }
}
