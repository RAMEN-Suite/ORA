import { Router } from 'express';
import { ExpressUtils } from '../utils/ExpressUtils';
import { getList } from '../handlers/get-list';
import { Listable } from '../models/List';
import { getFacets } from '../handlers/get-facets';
import { query, ValidationChain } from 'express-validator';
import { REGEXP } from '../constants/REGEXP';
import { Utils } from '../utils/Utils';

const router: Router = Router();

const validateFilterQueries: ValidationChain[] = [
  query('label').optional().isString().isLength({ min: 1, max: 48 }).trim().escape().matches(REGEXP.PROPERTY),
  query('search').optional().isString().isLength({ min: 1, max: 240 }).trim().escape(),

  query('facets').optional().customSanitizer(Utils.parseArray).isArray({ max: 10 }),
  query('facets.*').isString().isLength({ min: 1, max: 96 }).trim().matches(REGEXP.QUERY),

  query('filters').optional().customSanitizer(Utils.parseArray).isArray({ max: 20 }),
  query('filters.*').isString().isLength({ min: 3, max: 240 }).trim(),
];

const validateListQueries: ValidationChain[] = [
  query('limit').optional().isInt({ min: 0, max: 500 }),
  query('skip').optional().isInt({ min: 0 }),
  query('orderBy').optional().isString().isLength({ min: 1, max: 96 }).trim().escape().matches(REGEXP.QUERY),
  query('asc').optional().isBoolean(),
  ...validateFilterQueries,
];

const entities: Router = Router({ mergeParams: true });
router.use('/entities', entities);

entities.get('/', validateListQueries, ExpressUtils.handleValidationResult, getList.bind(null, Listable.ENTITY));
entities.get('/facets', validateFilterQueries, ExpressUtils.handleValidationResult, getFacets.bind(null, Listable.ENTITY));

const collections: Router = Router({ mergeParams: true });
router.use('/collections', collections);

collections.get('/', validateListQueries, ExpressUtils.handleValidationResult, getList.bind(null, Listable.COLLECTION));
collections.get('/facets', validateFilterQueries, ExpressUtils.handleValidationResult, getFacets.bind(null, Listable.COLLECTION));

export const DataRoutes: Router = router;
