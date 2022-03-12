import { Response, Request, Router, NextFunction } from 'express';
import ExperimentsController from '../../controllers/experiments';

const router = Router();

router.post('/upsert-file', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ddLogger.verbose("In upsert file controller. body=", req.body);
    return res.send({stat: "true"});
  } catch (err) {
    next(err);
  }
});
  
router.get('/', ExperimentsController.getExperiments);

router.get('/alerts', ExperimentsController.getExperimentAlerts);

router.post('/flag', ExperimentsController.flagExperimentThreshold);

router.get('/flag', ExperimentsController.getDailyExperimentThreshold);

export const experimentsRoutes = router;
