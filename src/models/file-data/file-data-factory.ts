import { FileType } from "../enums/file-types";
import BaseFileData from "./base";
import CartridgeFileData from "./cartridge-file-data";
import ExperimentsFileData from "./experiment-file-data";
import NotificationFileData from "./notification-file-data";
import SystemLogsFileData from "./system-log-file-data";
import ThresholdStatusFileData from "./threshold-status-file-data";

export default class FileDataFactory {
    static create(file_type: FileType): BaseFileData {
        let fileData: BaseFileData;

        switch (file_type) {
            case FileType.SystemLog:
                fileData = new SystemLogsFileData();
                break;
            case FileType.Cartridge:
                fileData = new CartridgeFileData();
                break;
            case FileType.Notification:
                fileData = new NotificationFileData();
                break;
            case FileType.Experiments:
                fileData = new ExperimentsFileData();
                break;
            case FileType.ThresholdStatus:
                fileData = new ThresholdStatusFileData();
                break;
            default:
                throw `Could not find file_type '${file_type}'.`
        }

        return fileData;
    }
}