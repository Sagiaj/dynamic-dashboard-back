import { Response, Request, NextFunction } from 'express';
import { TaskType } from '../../models/enums/task-types';
import TaskExecuterService from '../../services/scheduling/task-executer';
const class_name = `SchedulingController`;

export default class SchedulingController {
  static async executeTask(req: Request, res: Response, next: NextFunction) {
      const method_name = `${class_name}/executeTask`;
      ddLogger.info(`${method_name} - start`);
      try {
        const task_type = req.params["task_type"] || null;
        ddLogger.verbose(`calling TaskExecuterService/executeTask`);
        if (!task_type) {
          return next(`Unrecognized task_type='${task_type}'`)
        }
        TaskExecuterService.executeTask(<TaskType>task_type);
        return res.send(true);
      } catch (err) {
        ddLogger.error(`${method_name} - Failed executing task. Error=`, err);
        next(err);
      }
    }
}
