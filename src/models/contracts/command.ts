export default interface ICommand {
    execute(): Promise<any>;
    undo(): Promise<any>;
}
