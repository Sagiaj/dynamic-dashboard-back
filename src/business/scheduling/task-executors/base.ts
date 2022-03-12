import ITaskExecutorCommand from "../../../models/contracts/scheduling/commands/task-executor";
import { FileType } from "../../../models/enums/file-types";
import { TaskType } from "../../../models/enums/task-types";
import BaseFileData from "../../../models/file-data/base";
import { TaskExecution } from "../../../services/scheduling/task-executer";

export default abstract class BaseTaskExecutorCommand implements ITaskExecutorCommand {
    protected __task_type: TaskType = TaskType.Default;
	protected __file_type = FileType.Default;
	protected __task_execution: TaskExecution = new TaskExecution(TaskType.Default, 0, 0, 0);

	protected constructor() {
		
	}

    get task_type() {
		return this.__task_type;
	}

	get file_type() {
		return this.__file_type;
	}

	get task_execution() {
		return this.__task_execution;
	}

	setTaskExecution(task_execution: TaskExecution): BaseTaskExecutorCommand {
		this.__task_execution = task_execution;
		return this;
	}

	abstract execute(): Promise<BaseFileData>;

	async undo() {
        return this;
	}
}