import { Entity } from '../models/ramen/Entity';
import { Nullable } from '../types/global';
import { QueryResult } from 'neo4j-driver';
import { Neo4jService } from '../services/Neo4jService';
import { Options } from '../models/utility/Options';
import { CypherUtils } from '../utils/CypherUtils';

export class EntityDAO {
  public static async getEntities(label: Nullable<string>, options: Options): Promise<Entity[]> {
    const query: string[] = label ? [`MATCH (e:Entity:${label})`] : [`MATCH (e:Entity)`];
    query.push(CypherUtils.getListQuery('e', options));
    query.push(`RETURN collect(properties(e)) as entities`);

    const result: Nullable<QueryResult> = await Neo4jService.run(query.join(' '));
    return result?.records[0]?.get('entities') ?? [];
  }
}
