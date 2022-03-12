import { Router } from 'express';
import SchedulingController from '../../controllers/scheduling';

const router = Router();

router.get('/:task_type/execute', SchedulingController.executeTask);

export const schedulingRoutes = router;
