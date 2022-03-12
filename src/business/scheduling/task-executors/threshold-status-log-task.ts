import moment from "moment";
import { CollectionsRevert } from "../../../models/collections";
import { FileType } from "../../../models/enums/file-types";
import { TaskType } from "../../../models/enums/task-types";
import FileDataFactory from "../../../models/file-data/file-data-factory";
import ThresholdStatusLogsFileParserStrategy from "../../../models/parsers/threshold-status";
import LogService from "../../../services/files/log-service";
import TaskExecuterService from "../../../services/scheduling/task-executer";
import BaseTaskExecutorCommand from "./base";

export default class ExecuteThresholdStatusLogsTaskCommand extends BaseTaskExecutorCommand {
    protected __task_type = TaskType.UpsertThresholdStatusLogFile;
    protected __file_type = FileType.ThresholdStatus;

    constructor() {
        super();
    }

    async execute() {
        const method_name = `ExecuteThresholdStatusLogsTaskCommand/execute`;
        ddLogger.info(`${method_name} - start`);
        const fileDataLoader = FileDataFactory.create(this.file_type);
        const lastExecution = await TaskExecuterService.getLastExecution(this.task_type, moment().utc().startOf("day").unix() * 1000);
        this.setTaskExecution(lastExecution);

        const strategy = new ThresholdStatusLogsFileParserStrategy();
        strategy.setHighWaterMark(lastExecution.highwater_mark);
        fileDataLoader.setFileParserStrategy(strategy);
        await fileDataLoader.load();
        const loadedData = fileDataLoader.getLoadedData();
        if (loadedData && loadedData.length > 0) {
            ddLogger.verbose(`${method_name} - calling LogService/saveLogs`);
            await LogService.saveLogs(loadedData, CollectionsRevert.threshold_status_logs);
        }

        this.task_execution.highwater_mark = strategy.getHighWaterMark();

        ddLogger.info(`${method_name} - end`);
        return fileDataLoader;
    }

    async undo() {
        return this;
    }
}