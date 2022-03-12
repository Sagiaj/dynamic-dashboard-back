import { TaskType } from "../../../enums/task-types";
import ICommand from "../../command";

export default interface ITaskExecutorCommand extends ICommand {
    task_type: TaskType;
};
