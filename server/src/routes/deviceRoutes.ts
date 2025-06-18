// src/routes/deviceRoutes.ts
import { Router } from 'express';
import {
  getDevices,
  getAllowedDevices,
  getDeviceById,
  addDevice,
  updateDevice,
  deleteDevice,
  updateDeviceStatus,
} from '../controllers/deviceController';
import { authenticateToken } from '../middleware/authMiddleware';
import { scannerOnly } from '../middleware/scannerMiddleware';

const router = Router();

// Rota específica para o scanner com token fixo
router.post('/', scannerOnly, addDevice);
router.get('/allowed', scannerOnly, getAllowedDevices);

// Autenticação JWT obrigatória para as restantes
router.use(authenticateToken);

router.get('/', getDevices);
router.get('/:id', getDeviceById);
router.put('/:id', updateDevice);
router.delete('/:id', deleteDevice);
router.patch('/:id/status', updateDeviceStatus);

export default router;