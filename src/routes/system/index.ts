import { Router } from 'express';
import SystemController from '../../controllers/system';

const router = Router();

router.get('/', SystemController.getThresholdStatus);

router.get('/cartridge', SystemController.getCartridgeDates);

router.get('/system-mode', SystemController.getSystemMode);

export const systemRoutes = router;
