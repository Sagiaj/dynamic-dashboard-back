import moment from "moment";
import { CollectionsRevert } from "../../../models/collections";
import { ISystemLogDataEntity } from "../../../models/entities/system-log-data";
import { FileType } from "../../../models/enums/file-types";
import { TaskType } from "../../../models/enums/task-types";
import SystemLogsFileData from "../../../models/file-data/system-log-file-data";
import SystemLogsFileParserStrategy from "../../../models/parsers/system-log";
import LogService from "../../../services/files/log-service";
import TaskExecuterService from "../../../services/scheduling/task-executer";
import BaseTaskExecutorCommand from "./base";

export default class ExecuteSystemLogsTaskCommand extends BaseTaskExecutorCommand {
    protected __task_type = TaskType.UpsertSystemLogFile;
    protected __file_type = FileType.SystemLog;

    constructor() {
        super();
    }

    async execute() {
        const method_name = `ExecuteSystemLogsTaskCommand/execute`;
        ddLogger.info(`${method_name} - start`);
        try {
            const fileDataLoader = new SystemLogsFileData();
            ddLogger.verbose(`${method_name} - calling TaskExecuterService/getLastExecution`);
            const lastExecution = await TaskExecuterService.getLastExecution(this.task_type, moment().utc().startOf("day").unix() * 1000);
            this.setTaskExecution(lastExecution);
    
            const strategy = new SystemLogsFileParserStrategy();
            strategy.setHighWaterMark(lastExecution.highwater_mark);
            fileDataLoader.setFileParserStrategy(strategy);
            await fileDataLoader.load();
            const loadedData: ISystemLogDataEntity[] = fileDataLoader.getLoadedData();
            if (loadedData && loadedData.length > 0) {
                ddLogger.verbose(`${method_name} - calling LogService/saveLogs [SystemLogs]`, loadedData);
                await LogService.saveLogs(loadedData, CollectionsRevert.system_logs);
            }
    
            this.task_execution.highwater_mark = strategy.getHighWaterMark();
    
            ddLogger.info(`${method_name} - end`);
            return fileDataLoader;
        } catch (err) {
            ddLogger.error(`${method_name} - Failed executing task. Error=`, err);
            throw err;
        }
    }

    async undo() {
        return this;
    }
}