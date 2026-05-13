import neo4j, { Driver, QueryResult, Session } from "neo4j-driver";
import { ServiceError } from "../models/utility/Error";
import { ERROR_CODE } from "../constants/ERROR_CODE";
import { logger } from "../utils/logger";
import { Utils } from "../utils/Utils";

export class Neo4jService {
  public static client: Driver | undefined;
  private static retries: number = 3;

  public static async initConnection(): Promise<void> {
    const host: string | undefined = process.env.NEO4J_HOST;
    if (!host) throw new ServiceError(ERROR_CODE.MISSING_ENV_VAR, "Missing NEO4J_HOST");

    const username: string | undefined = process.env.NEO4J_USERNAME;
    if (!username) throw new ServiceError(ERROR_CODE.MISSING_ENV_VAR, "Missing NEO4J_USERNAME");

    const password: string | undefined = process.env.NEO4J_PASSWORD;
    if (!password) throw new ServiceError(ERROR_CODE.MISSING_ENV_VAR, "Missing NEO4J_PASSWORD");

    try {
      this.client = neo4j.driver(host, neo4j.auth.basic(username, password), { disableLosslessIntegers: true });
      await this.client.verifyConnectivity();
    } catch (error: unknown) {
      if (this.retries-- === 0) throw error;

      logger.warn(error, "Neo4jService failed to initialize (%d attempts left).", this.retries);
      await Utils.sleep(5);
      await this.initConnection();
    }
  }

  public static async run(query: string, ...args: unknown[]): Promise<QueryResult | null> {
    if (!this.client) throw new ServiceError(ERROR_CODE.NOT_INITIALIZED, "Neo4jService not initialized");
    const session: Session = this.client.session();
    let result: QueryResult | null = null;

    try {
      logger.debug({ query, args }, "Neo4jService: Performing a query.");
      result = await session.run(query, ...args);
    } catch (error: unknown) {
      logger.error(error, "Neo4jService: Failed to query.");
    } finally {
      await session.close();
    }

    return result;
  }
}

export async function initNeo4jService(): Promise<void> {
  logger.info("Neo4jService: Initializing...");
  await Neo4jService.initConnection();
  logger.info("Neo4jService: Connected to Neo4j.");
}
