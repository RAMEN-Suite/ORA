import { Errback, Express, NextFunction, Request, Response } from 'express';
import { checkExact, Result, ValidationError, validationResult } from 'express-validator';
import helmet from 'helmet';
import { SYSTEM_VALUE } from '../constants/SYSTEM_VALUE';
import { logger } from './logger';
import { STATUS_CODE } from '../constants/STATUS_CODE';

export class ExpressUtils {
  public static attachSecurityMeasures(application: Express): void {
    application.disable('x-powered-by');
    application.set('trust proxy', true);
    application.use(helmet());
  }

  public static attachGenericResponses(application: Express): void {
    application.get('/api/health', this.handleHealthCheck);
    application.use(this.handleNotFound);
    application.use(this.handleInternal);
  }

  public static async handleValidationResult(req: Request, res: Response, next: NextFunction): Promise<void> {
    await checkExact().run(req);

    const result: Result<ValidationError> = validationResult(req);
    if (!result.isEmpty() && SYSTEM_VALUE.IS_PRODUCTION) {
      logger.warn(result.array(), 'Request is not valid.');
      res.status(STATUS_CODE.BAD_REQUEST).json();
      return;
    }

    if (!result.isEmpty() && SYSTEM_VALUE.IS_DEVELOPMENT) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ errors: result.array() });
      return;
    }

    next();
  }

  private static handleHealthCheck(_: Request, res: Response): void {
    res.status(200).json();
  }

  private static handleInternal(err: Errback, _: Request, res: Response, __: NextFunction): void {
    logger.error(err, 'Request computation has failed.');
    res.status(STATUS_CODE.INTERNAL).json();
  }

  private static handleNotFound(_: Request, res: Response): void {
    res.status(STATUS_CODE.NOT_FOUND).json();
  }
}
