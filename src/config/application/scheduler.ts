import { TaskType } from "../../models/enums/task-types";
import TaskSchedulerService from "../../services/scheduling/task-scheduler";

export default class ApplicationScheduler {
    private static __instance: ApplicationScheduler;

    private constructor() {}

    static getInstance(): ApplicationScheduler {
        if (!this.__instance) {
            this.__instance = new ApplicationScheduler();
        }
        return this.__instance;
    }

    async init() {
        const method_name = `ApplicationScheduler/init`;
        ddLogger.info(`${method_name} - start`);
        for (let scheduled_task of Globals.scheduled_tasks) {
            try {
                ddLogger.verbose(`${method_name} - setting task type = '${scheduled_task.task_type}'`);
                if (scheduled_task.task_type === TaskType.Default) {
                    continue;
                } else {
                    // Start scheduling the task
                    ddLogger.verbose(`${method_name} - calling TaskSchedulerService/scheduleTask`);
                    TaskSchedulerService.scheduleTask(scheduled_task.task_type, scheduled_task.cron_expression);
                }
            } catch (task_err) {
                ddLogger.error(`${method_name} - Could not schedule task type '${scheduled_task.task_type}. Error='`, task_err);
            }
        }
    }
}