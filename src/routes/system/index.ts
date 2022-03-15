import { Router } from 'express';
import SystemController from '../../controllers/system';

const router = Router();

router.get('/', SystemController.getThresholdStatus);

router.get('/cartridge', SystemController.getCartridgeDates);

export const systemRoutes = router;
