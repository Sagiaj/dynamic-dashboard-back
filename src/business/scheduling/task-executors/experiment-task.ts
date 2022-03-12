import BaseTaskExecutorCommand from "./base";
import { TaskType } from "../../../models/enums/task-types";
import { FileType } from "../../../models/enums/file-types";
import TaskExecuterService from "../../../services/scheduling/task-executer";
import moment from "moment";
import { CollectionsRevert } from "../../../models/collections";
import LogService from "../../../services/files/log-service";
import ExperimentsFileData from "../../../models/file-data/experiment-file-data";
import ExperimentLogsFileParserStrategy from "../../../models/parsers/experiment-log";

export default class ExecuteExperimentTaskCommand extends BaseTaskExecutorCommand {
    protected __task_type = TaskType.UpsertExperimentsLogfile;
    protected __file_type = FileType.Experiments;

    constructor() {
        super();
    }

    async execute() {
        const method_name = `ExecuteExperimentTaskCommand/execute`;
        ddLogger.info(`${method_name} - start`);
        try {
            const fileDataLoader = new ExperimentsFileData();
            const lastExecution = await TaskExecuterService.getLastExecution(this.task_type, moment().utc().startOf("day").unix() * 1000);
            this.setTaskExecution(lastExecution);

            const strategy = new ExperimentLogsFileParserStrategy();
            strategy.setHighWaterMark(lastExecution.highwater_mark);
            fileDataLoader.setFileParserStrategy(strategy);
            await fileDataLoader.load();
            const loadedData = fileDataLoader.getLoadedData();
            if (loadedData && loadedData.length > 0) {
                ddLogger.verbose(`${method_name} - calling LogService/saveLogs`);
                await LogService.saveLogs(loadedData, CollectionsRevert.experiment_logs);
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
