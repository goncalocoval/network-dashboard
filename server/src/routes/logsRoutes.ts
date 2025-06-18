import { Router } from 'express';
import { getLogByType } from '../controllers/logsController';

const router = Router();

router.get('/:type', getLogByType);

export default router;