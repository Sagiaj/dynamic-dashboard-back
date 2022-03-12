import BaseScheduleTaskCommand from "./base";

type CommandMap = {
    [job_name: string]: BaseScheduleTaskCommand;
};

export default class TaskSchedulerInvoker {
	private commands: CommandMap = {};
    private static __instance: TaskSchedulerInvoker;

    private constructor() {}

    static getInstance() {
        if (!this.__instance) {
            this.__instance = new TaskSchedulerInvoker();
        }

        return this.__instance;
    }

	taskExists<T extends keyof CommandMap>(job_name: T): boolean {
        return this.commands && job_name && this.commands[job_name] && (job_name in this.commands);
    }

	scheduleTask(command: BaseScheduleTaskCommand) {
        this.cancelTask(command.job_name);
		this.commands[command.job_name] = command;
		command.execute();
	}

	cancelTask(job_name: string) {
        if (this.taskExists(job_name)) {
            (this.commands[job_name]).undo();
            delete this.commands[job_name];
        }
	}
}