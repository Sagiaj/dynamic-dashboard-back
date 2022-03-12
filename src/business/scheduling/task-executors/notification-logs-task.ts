import moment from "moment";
import { CollectionsRevert } from "../../../models/collections";
import { FileType } from "../../../models/enums/file-types";
import { TaskType } from "../../../models/enums/task-types";
import FileDataFactory from "../../../models/file-data/file-data-factory";
import NotificationLogsFileParserStrategy from "../../../models/parsers/notification-log";
import LogService from "../../../services/files/log-service";
import TaskExecuterService from "../../../services/scheduling/task-executer";
import BaseTaskExecutorCommand from "./base";

export default class ExecuteNotificationLogsTaskCommand extends BaseTaskExecutorCommand {
    protected __task_type = TaskType.UpsertNotificationsLogFile;
    protected __file_type = FileType.Notification;

    constructor() {
        super();
    }

    async execute() {
        const method_name = `ExecuteNotificationLogsTaskCommand/execute`;
        ddLogger.info(`${method_name} - start`);
        const fileDataLoader = FileDataFactory.create(this.file_type);
        const lastExecution = await TaskExecuterService.getLastExecution(this.task_type, moment().utc().startOf("day").unix() * 1000);
        this.setTaskExecution(lastExecution);

        const strategy = new NotificationLogsFileParserStrategy();
        strategy.setHighWaterMark(lastExecution.highwater_mark);
        fileDataLoader.setFileParserStrategy(strategy);
        await fileDataLoader.load();
        const loadedData = fileDataLoader.getLoadedData();
        if (loadedData && loadedData.length > 0) {
            ddLogger.verbose(`${method_name} - calling LogService/saveLogs`);
            await LogService.saveLogs(loadedData, CollectionsRevert.notification_logs);
        }

        this.task_execution.highwater_mark = strategy.getHighWaterMark();

        ddLogger.info(`${method_name} - end`);
        return fileDataLoader;
    }

    async undo() {
        return this;
    }
}