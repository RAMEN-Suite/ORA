import neo4j, { Driver, QueryResult, Session } from 'neo4j-driver';
import { ServiceError } from '../models/utility/Error';
import { ERROR_CODE } from '../constants/ERROR_CODE';
import { logger } from '../utils/logger';
import { Utils } from '../utils/Utils';
import { EnvironmentUtils } from '../utils/EnvironmentUtils';

export class Neo4jService {
  private static client: Driver | undefined;
  private static readonly maxRetries: number = -1;
  private static readonly retryDelaySeconds: number = 5;

  public static async initConnection(retries: number = this.maxRetries): Promise<void> {
    const host: string = EnvironmentUtils.resolveEnvironment('NEO4J_HOST');
    const username: string = EnvironmentUtils.resolveEnvironment('NEO4J_USERNAME');
    const password: string = EnvironmentUtils.resolveEnvironment('NEO4J_PASSWORD');

    try {
      this.client = neo4j.driver(host, neo4j.auth.basic(username, password), { disableLosslessIntegers: true });
      await this.client.verifyConnectivity();
    } catch (error: unknown) {
      if (retries === 0) {
        logger.error(error, 'Neo4jService: Failed to initialize.');
        throw error;
      }

      logger.warn(error, 'Neo4jService failed to initialize (%d attempts left).', retries);
      await Utils.sleep(this.retryDelaySeconds);
      await this.initConnection(retries === -1 ? -1 : retries - 1);
    }
  }

  public static async run(query: string, parameters?: Record<string, unknown>): Promise<QueryResult> {
    if (!this.client) throw new ServiceError(ERROR_CODE.NOT_INITIALIZED, 'Neo4jService not initialized');
    const session: Session = this.client.session();

    try {
      logger.debug({ query, parameters }, 'Neo4jService: Performing a query.');
      return await session.run(query, parameters);
    } catch (error: unknown) {
      logger.error(error, 'Neo4jService: Failed to query.');
      throw error;
    } finally {
      await session.close();
    }
  }

  public static async closeConnection(): Promise<void> {
    if (!this.client) return;
    await this.client.close();
    this.client = undefined;
  }
}

export async function initNeo4jService(): Promise<void> {
  logger.info('Neo4jService: Initializing...');
  await Neo4jService.initConnection();
  logger.info('Neo4jService: Connected to Neo4j.');
}
