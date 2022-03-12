import IFileParserStrategy from "../contracts/file-parser";
import { FileType } from "../enums/file-types";
import { ReadStream } from "fs";
import { Readable } from "stream";

export default abstract class BaseFileParserStrategy implements IFileParserStrategy {
    protected _last_highwater_mark: number = 0;
    protected _file_read_stream: ReadStream = <ReadStream>Readable.from([]);
    protected _file_type: FileType = FileType.Default;

    protected constructor(read_stream?: ReadStream) {
        if (read_stream) { this._file_read_stream = read_stream; }
    }

    abstract parse(): Promise<any>;

    setHighWaterMark(last_highwater_mark: number) {
        this._last_highwater_mark = last_highwater_mark;
    }

    getFileType(): FileType {
        return this._file_type;
    }

    setFileReadStream(read_stream: ReadStream): BaseFileParserStrategy {
        this._file_read_stream = read_stream;
        return this;
    }

    getFileReadStream(): ReadStream {
        return <ReadStream>this._file_read_stream;
    }
    
    getHighWaterMark(): number {
        return this._last_highwater_mark;
    }
}
