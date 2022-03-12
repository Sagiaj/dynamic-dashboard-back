import moment from "moment";
import TaskExecutorCommandFactory from "../../business/scheduling/task-executors/task-executor-command-factory";
import { Collections } from "../../models/collections";
import { TaskType } from "../../models/enums/task-types";
import MongodbProvider from "../../providers/mongodb-provider";
import { Mutex } from "../../utilities/mutex";

export class TaskExecution {
    execution_type: TaskType = TaskType.Default;
    start_of_day_ts: number;
    execution_ts: number;
    highwater_mark: number;

    constructor(type: TaskType, start_of_day_ts: number, execution_ts: number, highwater_mark: number) {
        this.start_of_day_ts = start_of_day_ts;
        this.execution_ts = execution_ts;
        this.highwater_mark = highwater_mark;
    }
}

export default class TaskExecuterService {

    private static async awaitQueuedTaskExecution(mutex: Mutex, timeout_ms: number = 5000): Promise<Mutex> {
        const method_name = `TaskExecuterService/awaitQueuedTaskExecution`;
        ddLogger.info(`${method_name} - start`);
        ddLogger.verbose(`${method_name} - params:`, { mutex, timeout_ms });
        try {
            await mutex.acquireLock();
            return mutex;
        } catch (err) {
            ddLogger.error(`${method_name} - Failed queuing task execution`, err);
            await mutex.releaseLock()
            throw err;
        }
    }

    private static async unqueueTaskExecution(mutex: Mutex) {
        const method_name = `TaskExecuterService/unqueueTaskExecution`;
        let unlocked = false;
        try {
            return new Promise(async (resolve, reject) => {
                try {
                    setTimeout(() => {
                        if (!unlocked) {
                            reject("Timed out on unlocking file")
                        }
                    }, 500);
                    await mutex.releaseLock();
                    unlocked = true;
                    resolve(true);
                } catch (error) {
                    ddLogger.error(`${method_name} - Failed releasing lock. Error=`, error);
                    reject(error);
                }
            });
        } catch (err) {
            await mutex.releaseLock();
            ddLogger.error(`${method_name} - Failed unqueuing task execution. Error=`, err);
            throw err;
        }
    }

    static async executeTask(task_type: TaskType) {
        const method_name = `TaskExecuterService/executeTask`;
        ddLogger.info(`${method_name} - start`);
        ddLogger.verbose(`${method_name} - task_type=${task_type}`);

        const mutex_lock = new Mutex(task_type);
        try {
            const lastExecutionTs: number = moment().utc().unix() * 1000;
            const startOfDayTs = moment().utc().startOf("day").unix() * 1000;
            const executorCommand = TaskExecutorCommandFactory.create(task_type);
            await this.awaitQueuedTaskExecution(mutex_lock, 8000);
            ddLogger.verbose(`${method_name} - continue queue execution`);
            const executionResults = await executorCommand.execute();
            const loadedData = executionResults.getLoadedData();
            if (loadedData && loadedData.length > 0) {
                ddLogger.verbose(`${method_name} - callig TaskExecuterService/saveTaskExecution`);
                await TaskExecuterService.saveTaskExecution(lastExecutionTs, task_type, startOfDayTs, executorCommand.task_execution.highwater_mark);
            }
            ddLogger.verbose(`${method_name} - calling TaskExecuterService/unqueueTaskExecution`);
            await this.unqueueTaskExecution(mutex_lock);
        } catch (err) {
            await this.unqueueTaskExecution(mutex_lock);
            ddLogger.error(`${method_name} - error. Error=`, err);
            throw err;
        }
    }

    static async getLastExecution(task_type: TaskType, start_of_day_ts: number): Promise<TaskExecution> {
        const method_name = `TaskExecuterService/getLastExecution`;
        ddLogger.info(`${method_name} - start`);
        ddLogger.verbose(`${method_name} - input parameters: `, {start_of_day_ts});
        try {
            const db_res: any = await MongodbProvider.getMongoObject({ execution_type: task_type, start_of_day_ts }, Collections.TaskExecutions);
            ddLogger.verbose(`${method_name} - db_res=`, db_res);
            if (!db_res) {
                const timezone_offset_ts = Date.now() + (100000 * (new Date().getTimezoneOffset()));
                ddLogger.verbose(`${method_name} - returning timezone offset = ${timezone_offset_ts}`);
                return new TaskExecution(task_type, start_of_day_ts, timezone_offset_ts, 0);
            }
            const lastExecution = new TaskExecution(task_type, db_res["start_of_day_ts"], db_res["execution_ts"], db_res["highwater_mark"]);
            ddLogger.verbose(`${method_name} - returning lastExecution=`, lastExecution);
            return lastExecution;
        } catch (err) {
            ddLogger.error("Failed getting last exeucion time. Error=", err);
            throw err;
        }
    }

    static async saveTaskExecution(execution_ts: number, execution_type: TaskType, start_of_day_ts: number, highwater_mark: number): Promise<boolean> {
        const method_name = `TaskExecuterService/saveTaskExecution`;
        ddLogger.info(`${method_name} - start`);
        ddLogger.verbose(`${method_name} - execution_ts=${execution_ts}, execution_type=${execution_type}, start_of_day_ts=${start_of_day_ts}, highwater_mark=${highwater_mark}`);
        try {
            ddLogger.verbose(`${method_name} - calling MongodbProvider/upsertMongoObject`);
            await MongodbProvider.upsertMongoObject({ execution_type, start_of_day_ts, highwater_mark: { $lte: highwater_mark } }, { execution_type, start_of_day_ts, execution_ts, highwater_mark }, Collections.TaskExecutions);
            return true;
        } catch (err) {
            ddLogger.error("Failed saving task execution. Error=", err);
            throw err;
        }
    }

    // static async saveExecutionResults<T extends {a: number}>(task_type: T, execution_results: BaseEntityData<T>[]) {
    //     const method_name = `TaskExecuterService/saveExecutionResults`;
    //     ddLogger.info(`${method_name} - start`);
    //     ddLogger.verbose(`${method_name} - execution_ts=${execution_ts}`);
    //     try {
    //         TaskExecuterService.TEMP_DB.system_logs.last_execution_ts = execution_ts;
    //         return true;
    //     } catch (err) {
    //         ddLogger.error("Failed saving task execution. Error=", err);
    //         throw err;
    //     }
    // }
}
