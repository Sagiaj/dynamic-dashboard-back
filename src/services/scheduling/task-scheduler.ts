import ScheduleTaskCommandFactory from "../../business/scheduling/task-schedulers/schedule-task-command-factory";
import TaskSchedulerInvoker from "../../business/scheduling/task-schedulers/task-scheduler-invoker";
import { TaskType } from "../../models/enums/task-types";

export default class TaskSchedulerService {
    static async scheduleTask(task_type: TaskType, cron_expression: string) {
        const method_name = `TaskSchedulerService/scheduleTask`;
        ddLogger.info(`${method_name} - start`);
        ddLogger.verbose(`${method_name} - params: task_type=${task_type}, cron_expression=${cron_expression}`);
        try {
            if (!cron_expression || cron_expression.length < 10) {
                throw `Invalid cron expression '${cron_expression}'`;
            }

            const taskInvokerInstance = TaskSchedulerInvoker.getInstance();
            ddLogger.verbose(`${method_name} - calling ScheduleTaskCommandFactory/create`);
            const scheduleTaskCommand = ScheduleTaskCommandFactory.create(task_type);

            scheduleTaskCommand.setCronExpression(cron_expression);
            ddLogger.verbose(`${method_name} - calling TaskSchedulerInvoker/scheduleTask`);
            taskInvokerInstance.scheduleTask(scheduleTaskCommand);
        } catch (err) {
            ddLogger.error(`${method_name} - Failed scheduling a task. Error=`, err);
            throw err;
        }
    }

    static async cancelTask(task_type: TaskType) {
        const method_name = `TaskSchedulerService/cancelTask`;
        ddLogger.info(`${method_name} - start`);
        try {
            const taskInvokerInstance = TaskSchedulerInvoker.getInstance();
            ddLogger.verbose(`${method_name} - calling ScheduleTaskCommandFactory/create`);
            const scheduleTaskCommand = ScheduleTaskCommandFactory.create(task_type);
            ddLogger.verbose(`${method_name} - calling TaskSchedulerInvoker/cancelTask`);
            taskInvokerInstance.cancelTask(scheduleTaskCommand.job_name);
        } catch (err) {
            ddLogger.error(`${method_name} - Failed scheduling a task. Error=`, err);
            throw err;
        }
    }
}
