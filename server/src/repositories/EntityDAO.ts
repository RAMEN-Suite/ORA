import { Entity, TypedEntity } from '../models/ramen/Entity';
import { Nullable } from '../types/global';
import { QueryResult } from 'neo4j-driver';
import { Neo4jService } from '../services/Neo4jService';

export class EntityDAO {
  public static async getEntities(): Promise<Entity[]> {
    const query: string = `MATCH (e:Entity) RETURN collect(properties(e)) as entities;`;
    const result: Nullable<QueryResult> = await Neo4jService.run(query);
    return result?.records[0]?.get('entities') ?? [];
  }

  public static async getTypedEntities(type: string): Promise<TypedEntity[]> {
    const query: string = `MATCH (e:Entity:${type}) RETURN collect(properties(e)) as entities;`;
    const result: Nullable<QueryResult> = await Neo4jService.run(query);
    return result?.records[0]?.get('entities') ?? [];
  }
}
