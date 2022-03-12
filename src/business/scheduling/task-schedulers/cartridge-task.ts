import { TaskType } from "../../../models/enums/task-types";
import AxiosProvider from "../../../providers/axios-provider";
import BaseScheduleTaskCommand from "./base";

export default class ScheduleCartridgeTaskCommand extends BaseScheduleTaskCommand {
	protected __job_name = TaskType.UpsertCartridgeLogFile;
	private static job_callback(name: string) {
		return (fireDate: Date) => {
			ddLogger.verbose(`job_name = '${name}', fireDate=${fireDate}`);
			AxiosProvider.makeRequest("GET", `${Globals.SERVER_URL}/scheduling/${TaskType.UpsertCartridgeLogFile}/execute`, {}).catch(err => {
				ddLogger.error("ERRORED IN TRIGGER", err);
			});
		};
	}

	constructor(cron_expression?: string, forbid_multiple: boolean = true) {
		super(cron_expression, forbid_multiple);
		this.setJobCallback(ScheduleCartridgeTaskCommand.job_callback(this.job_name));
	}
}
