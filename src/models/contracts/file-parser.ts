import { FileType } from "../enums/file-types";
// import { ReadStream } from "fs";
import { Readable } from "stream";

export default interface IFileParserStrategy {
    parse(): Promise<any>;
    getFileType(): FileType;
    setFileReadStream(read_stream: Readable): IFileParserStrategy;
    getFileReadStream(): Readable;
}
