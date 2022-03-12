import CartridgeFileParserStrategy from "../../../models/parsers/cartridge";
import BaseTaskExecutorCommand from "./base";
import { TaskType } from "../../../models/enums/task-types";
import { FileType } from "../../../models/enums/file-types";
import TaskExecuterService from "../../../services/scheduling/task-executer";
import moment from "moment";
import { CollectionsRevert } from "../../../models/collections";
import LogService from "../../../services/files/log-service";
import CartridgeFileData from "../../../models/file-data/cartridge-file-data";

export default class ExecuteCartridgeTaskCommand extends BaseTaskExecutorCommand {
    protected __task_type = TaskType.UpsertCartridgeLogFile;
    protected __file_type = FileType.Cartridge;

    constructor() {
        super();
    }

    async execute() {
        const method_name = `ExecuteCartridgeTaskCommand/execute`;
        ddLogger.info(`${method_name} - start`);
        const fileDataLoader = new CartridgeFileData();
        const lastExecution = await TaskExecuterService.getLastExecution(this.task_type, moment().utc().startOf("day").unix() * 1000);
        this.setTaskExecution(lastExecution);

        const strategy = new CartridgeFileParserStrategy();
        strategy.setHighWaterMark(lastExecution.highwater_mark);
        fileDataLoader.setFileParserStrategy(strategy);
        await fileDataLoader.load();
        const loadedData = fileDataLoader.getLoadedData();
        if (loadedData && loadedData.length > 0) {
            ddLogger.verbose(`${method_name} - calling LogService/saveLogs`);
            await LogService.saveLogs(loadedData, CollectionsRevert.cartridge_logs);
        }

        this.task_execution.highwater_mark = strategy.getHighWaterMark();

        ddLogger.info(`${method_name} - end`);
        return fileDataLoader;
    }

    async undo() {
        return this;
    }
}
