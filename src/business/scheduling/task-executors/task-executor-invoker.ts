import { TaskType } from "../../../models/enums/task-types";
import BaseTaskExecutorCommand from "./base";

type CommandMap = {
    [task_type: string]: BaseTaskExecutorCommand;
};

export default class TaskExecutorInvoker {
	private commands: CommandMap = {};
    private static __instance: TaskExecutorInvoker;

    private constructor() {}

    static getInstance() {
        if (!this.__instance) {
            this.__instance = new TaskExecutorInvoker();
        }

        return this.__instance;
    }

	taskExists<T extends keyof CommandMap>(task_type: T): boolean {
        return this.commands && task_type && this.commands[task_type] && (task_type in this.commands);
    }

	scheduleTask(command: BaseTaskExecutorCommand) {
        this.cancelTask(command.task_type);
		this.commands[command.task_type] = command;
		command.execute();
	}

	cancelTask(task_type: TaskType) {
        if (this.taskExists(task_type)) {
            (this.commands[task_type]).undo();
            delete this.commands[task_type];
        }
	}
}