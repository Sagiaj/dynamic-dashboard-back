import { JobCallback } from "node-schedule";
import IScheduleTaskCommand from "../../../models/contracts/scheduling/commands/task-scheduler";
import { TaskType } from "../../../models/enums/task-types";
import TaskSchedulerProvider from "../../../providers/task-scheduler-provider";

export default abstract class BaseScheduleTaskCommand implements IScheduleTaskCommand {
	protected __cron_expression: string;
	protected __job_name: string = TaskType.Default;
	protected job_callback?: JobCallback;

	protected constructor(
		cron_expression?: string,
		forbid_multiple: boolean = true
	) {
		this.__cron_expression = cron_expression || "";
		if (forbid_multiple) {
			this.__job_name = `${this.__job_name}_${Date.now()}`;
		}
	}

	get job_name() {
		return this.__job_name;
	}

	setCronExpression(cron_expression: string): BaseScheduleTaskCommand {
		this.__cron_expression = cron_expression
		return this;
	}

	setJobCallback(callback: JobCallback) {
		this.job_callback = callback;
	}

	async execute() {
		TaskSchedulerProvider.scheduleTask(this.__cron_expression, this.__job_name, this.job_callback);
        return this;
	}

	async undo() {
		TaskSchedulerProvider.cancelTaskScheduling(this.__job_name);
        return this;
	}
}