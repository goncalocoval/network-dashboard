// routes/networkRoutes.ts
import express from 'express';
import { getConnectedDevices } from '../controllers/networkController';

const router = express.Router();

router.get('/devices', getConnectedDevices);

export default router;