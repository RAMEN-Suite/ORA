import { Collection, TypedCollection } from '../models/ramen/Collection';
import { Nullable } from '../types/global';
import { QueryResult } from 'neo4j-driver';
import { Neo4jService } from '../services/Neo4jService';

export class CollectionDAO {
  public static async getCollections(): Promise<Collection[]> {
    const query: string = `MATCH (c:Collection) RETURN collect(properties(c)) as collections`;
    const result: Nullable<QueryResult> = await Neo4jService.run(query);
    return result?.records[0]?.get('collections') ?? [];
  }

  public static async getTypedCollections(type: string): Promise<TypedCollection[]> {
    const query: string = `MATCH (e:Collection:${type}) RETURN collect(properties(e)) as collections;`;
    const result: Nullable<QueryResult> = await Neo4jService.run(query);
    return result?.records[0]?.get('collections') ?? [];
  }
}
