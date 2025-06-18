import { Router, Request, Response } from 'express';
import { shareAuthenticator, viewBlockedIps } from '../controllers/sshController';

const router = Router();

router.post('/share', (req: Request, res: Response) => {
  shareAuthenticator(req, res);
});
router.get('/view', (req: Request, res: Response) => {
  viewBlockedIps(req, res);
});

export default router;