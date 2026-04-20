import { Router } from 'express';
import { DataRoutes } from './DataRoutes';

const router: Router = Router();

router.use('/data/', DataRoutes);

export const APIRouter: Router = router;
