import ICommand from "../../command";

export default interface IScheduleTaskCommand extends ICommand {
    job_name: string;
}
