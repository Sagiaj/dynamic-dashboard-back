import { Router } from 'express';
import ObjectsController from '../../controllers/objects';

const router = Router();

router.get('/detections-hourly-average', ObjectsController.getHourlyObjectAverage);

router.get('/group-total-detections', ObjectsController.getTotalDetectionsByType);

router.get('/detections', ObjectsController.getDetections);

export const objectRoutes = router;
