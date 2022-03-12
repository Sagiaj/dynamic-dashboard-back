import { TaskType } from "../../../models/enums/task-types";
import BaseTaskExecutorCommand from "./base";
import ExecuteCartridgeTaskCommand from "./cartridge-task";
import ExecuteExperimentTaskCommand from "./experiment-task";
import ExecuteNotificationLogsTaskCommand from "./notification-logs-task";
import ExecuteSystemLogsTaskCommand from "./system-logs-task";
import ExecuteThresholdStatusLogsTaskCommand from "./threshold-status-log-task";

export default class TaskExecutorCommandFactory {
    static create(task_type: TaskType): BaseTaskExecutorCommand {
        const method_name = `TaskExecutorCommandFactory/create`;
        let taskExecutor: BaseTaskExecutorCommand;

        switch (task_type) {
            case TaskType.UpsertCartridgeLogFile:
                taskExecutor = new ExecuteCartridgeTaskCommand();
                break;
            case TaskType.UpsertSystemLogFile:
                taskExecutor = new ExecuteSystemLogsTaskCommand();
                break;
            case TaskType.UpsertNotificationsLogFile:
                taskExecutor = new ExecuteNotificationLogsTaskCommand();
                break;
            case TaskType.UpsertExperimentsLogfile:
                taskExecutor = new ExecuteExperimentTaskCommand();
                break;
            case TaskType.UpsertThresholdStatusLogFile:
                taskExecutor = new ExecuteThresholdStatusLogsTaskCommand();
                break;
            default:
                ddLogger.error(`${method_name} - Could not find task_type='${task_type}'`);
                throw `Could not find task_type='${task_type}'`;
        }

        return taskExecutor;
    }
}