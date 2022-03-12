import IFileParserStrategy from "../contracts/file-parser";
import BaseEntityData from "../entities/base";
// import BaseFileParserStrategy from "../parsers/base";

export default abstract class BaseFileData {
    private __data: BaseEntityData<any>[] = [];
    private __file_parser: IFileParserStrategy;
    private __file_highwater_mark: number = 0;
    
    abstract load(): Promise<BaseFileData>;
    
    protected constructor(parsing_strategy: IFileParserStrategy) { this.__file_parser = parsing_strategy; }

    protected setFileData(data: any[]) {
        this.__data = data;
    }

    getLoadedData(): BaseEntityData<any>["data"][] {
        return this.__data;
    }

    getFileParserStrategy(): IFileParserStrategy {
        return this.__file_parser;
    }

    getFileHighWaterMark(): number {
        return this.__file_highwater_mark;
    }

    setFileParserStrategy(parser: IFileParserStrategy): BaseFileData {
        this.__file_parser = parser;
        return this;
    }

    setFileHighWaterMark(highwater_mark: number): BaseFileData {
        this.__file_highwater_mark = highwater_mark;
        return this;
    }
}