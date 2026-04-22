import {Router} from 'express';
import {query} from 'express-validator';
import {getEntities} from '../handlers/database/get-entities';
import {ExpressUtils} from '../utils/ExpressUtils';
import {getCollections} from '../handlers/database/get-collections';
import {REGEXP} from '../constants/REGEXP';

const router: Router = Router();

router.get(
  '/entities',
  query('type').isString().isLength({ min: 1, max: 48 }).matches(REGEXP.PROPERTY).escape().optional(),
  query('limit').isInt({ min: 1, max: 200 }).optional(),
  query('skip').isInt({ min: 0 }).optional(),
  query('orderBy').isString().isLength({ min: 1, max: 48 }).matches(REGEXP.PROPERTY).escape().optional(),
  query('asc').isBoolean().optional(),
  ExpressUtils.handleValidationResult,
  getEntities,
);

router.get(
  '/collections',
  query('type').isString().isLength({ min: 1, max: 48 }).matches(REGEXP.PROPERTY).escape().optional(),
  query('limit').isInt({ min: 1, max: 200 }).optional(),
  query('skip').isInt({ min: 0 }).optional(),
  query('orderBy').isString().isLength({ min: 1, max: 48 }).matches(REGEXP.PROPERTY).escape().optional(),
  query('asc').isBoolean().optional(),
  ExpressUtils.handleValidationResult,
  getCollections,
);

export const DataRoutes: Router = router;
