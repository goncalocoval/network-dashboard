import express from 'express';
import { generateVPNClient, resetVPN, downloadVPNClient } from '../controllers/vpnController';

const router = express.Router();

router.post('/generate', generateVPNClient);
router.post('/reset', resetVPN);
router.get('/download/:filename', downloadVPNClient);

export default router;