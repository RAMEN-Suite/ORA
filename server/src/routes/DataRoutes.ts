import {Router} from 'express';
import {query} from 'express-validator';
import {getEntities} from '../handlers/database/get-entities';
import {ExpressUtils} from '../utils/ExpressUtils';
import {getCollections} from '../handlers/database/get-collections';

const router: Router = Router();

router.get(
  '/entities',
  query('type').isString().isLength({ min: 1, max: 48 }).escape().optional(),
  ExpressUtils.handleValidationResult,
  getEntities,
);

router.get(
  '/collections',
  query('type').isString().isLength({ min: 1, max: 48 }).escape().optional(),
  ExpressUtils.handleValidationResult,
  getCollections,
);

export const DataRoutes: Router = router;
