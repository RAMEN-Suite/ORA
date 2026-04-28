import { Router } from 'express';
import { query, ValidationChain } from 'express-validator';
import { ExpressUtils } from '../utils/ExpressUtils';
import { REGEXP } from '../constants/REGEXP';
import { getList } from '../handlers/get-list';
import { Listable } from '../database/ListDAO';

const router: Router = Router();

const validatePagination: ValidationChain[] = [
  query('type').optional().isString().isLength({ min: 1, max: 48 }).trim().escape().matches(REGEXP.PROPERTY),
  query('limit').optional().isInt({ min: 0, max: 500 }),
  query('skip').optional().isInt({ min: 0 }),
  query('orderBy').optional().isString().isLength({ min: 1, max: 48 }).trim().escape().matches(REGEXP.PROPERTY),
  query('asc').optional().isBoolean(),
  query('search').optional().isString().isLength({ min: 1, max: 240 }).trim().escape(),
  query('field').optional().isString().isLength({ min: 1, max: 48 }).trim().escape().matches(REGEXP.PROPERTY),
];

router.get('/entities', validatePagination, ExpressUtils.handleValidationResult, getList.bind(null, Listable.ENTITY));
router.get('/collections', validatePagination, ExpressUtils.handleValidationResult, getList.bind(null, Listable.COLLECTION));

export const DataRoutes: Router = router;
