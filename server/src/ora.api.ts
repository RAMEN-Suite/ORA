import express, { Express } from 'express';
import { ExpressUtils } from './utils/ExpressUtils';
import { httpLogger, logger } from './utils/logger';
import { APIRouter } from './routes/APIRouter';
import { initNeo4jService } from './services/Neo4jService';

const ORA_SERVER_PORT: string = process.env.ORA_SERVER_PORT ?? '3000';

await initNeo4jService();

const application: Express = express();
ExpressUtils.attachSecurityMeasures(application);

application.use(httpLogger);
application.use(express.json());

application.use('/api/', APIRouter);
ExpressUtils.attachGenericResponses(application);

application
  .listen(ORA_SERVER_PORT, (): void => logger.info(`ORA API is listening on ${ORA_SERVER_PORT}.`))
  .on('error', (error: Error): void => logger.error(error));
