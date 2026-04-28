import { Router } from 'express';
import { DataRoutes } from './DataRoutes';
import { getConfig } from '../handlers/get-config';

const router: Router = Router();

router.get('/config', getConfig);
router.use('/data/', DataRoutes);

export const APIRouter: Router = router;
