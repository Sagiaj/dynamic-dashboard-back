import { TaskType } from "../../../models/enums/task-types";
import BaseScheduleTaskCommand from "./base";
import ScheduleCartridgeTaskCommand from "./cartridge-task";
import ScheduleUpsertExperimentLogFileTaskCommand from "./upsert-experiment-log-file-task";
import ScheduleUpsertNotificationLogFileTaskCommand from "./upsert-notification-log-file-task";
import ScheduleUpsertSystemLogFileTaskCommand from "./upsert-system-log-file-task";
import ScheduleUpsertThresholdStatusFileTaskCommand from "./upsert-threshold-status-file-task";

export default class ScheduleTaskCommandFactory {
    static create(task_type: TaskType): BaseScheduleTaskCommand {
        const method_name = `ScheduleTaskCommandFactory/create`;
        let taskScheduler: BaseScheduleTaskCommand;

        switch (task_type) {
            case TaskType.UpsertCartridgeLogFile:
                taskScheduler = new ScheduleCartridgeTaskCommand();
                break;
            case TaskType.UpsertSystemLogFile:
                taskScheduler = new ScheduleUpsertSystemLogFileTaskCommand();
                break;
            case TaskType.UpsertNotificationsLogFile:
                taskScheduler = new ScheduleUpsertNotificationLogFileTaskCommand();
                break;
            case TaskType.UpsertExperimentsLogfile:
                taskScheduler = new ScheduleUpsertExperimentLogFileTaskCommand();
                break;
            case TaskType.UpsertThresholdStatusLogFile:
                taskScheduler = new ScheduleUpsertThresholdStatusFileTaskCommand();
                break;
            default:
                ddLogger.error(`${method_name} - Could not find task_type='${task_type}'`);
                throw `Could not find task_type='${task_type}'`
        }

        return taskScheduler;
    }
}
