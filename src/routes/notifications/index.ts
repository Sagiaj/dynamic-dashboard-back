import { Router } from 'express';
import NotificationsController from '../../controllers/notifications';

const router = Router();

router.get('/', NotificationsController.getLastNotifications);

export const notificationsRoutes = router;
