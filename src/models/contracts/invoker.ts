import ICommand from "./command";

export abstract class Invoker {
    protected commands: ICommand[];

    protected constructor(commands: ICommand[]) {
        this.commands = commands;
    }

    protected isCommand(object: any): object is ICommand {
        return object.execute !== undefined;
    }
}
