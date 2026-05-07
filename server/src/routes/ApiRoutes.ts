import { Router } from 'express';
import { DataRoutes } from './DataRoutes';
import { getConfig } from '../handlers/get-config';
import { getLanguage } from '../handlers/get-language';
import { ExpressUtils } from '../utils/ExpressUtils';
import { param } from 'express-validator';
import { REGEXP } from '../constants/REGEXP';

const router: Router = Router();

router.get('/config', getConfig);
router.get('/i18n/:language.json', param('language').matches(REGEXP.LANGUAGE), ExpressUtils.handleValidationResult, getLanguage);

router.use('/data/', DataRoutes);

export const ApiRoutes: Router = router;
