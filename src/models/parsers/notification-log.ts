import moment from "moment";
import IFileParserStrategy from "../contracts/file-parser";
import { FileType } from "../enums/file-types";
import { ReadStream } from "fs";
import BaseFileParserStrategy from "./base";
import FileReader from "../../utilities/file-reader";
import NotificationLogDataEntity, { INotificationLogDataEntity, NotificationType } from "../entities/notification";

export default class NotificationLogsFileParserStrategy extends BaseFileParserStrategy implements IFileParserStrategy {
    private static __end_of_day = new Date();
    protected _file_type: FileType = FileType.Notification;

    constructor(read_stream?: ReadStream) {
        super(read_stream);
    }

    async parse(): Promise<INotificationLogDataEntity[]> {
        const method_name = `NotificationLogsFileParserStrategy/parse`;
        ddLogger.info(`${method_name} - start`);
        try {
            const lower_threshold = this._last_highwater_mark;
            const readStream = this.getFileReadStream();
            const lines = await FileReader.createLineReaderStream(readStream);
            const notifications: INotificationLogDataEntity[] = [];
            let lineTime: number;

            console.time(`${process.env.pm_id}-${this._file_type}`);
            let i = -1;
            for await (const summary_line of lines) {
                i++;
                if (i <= lower_threshold) { continue; }
                lineTime = this.getLineTime(summary_line);
                const model = new NotificationLogDataEntity();
                model.data.timestamp = lineTime;
                model.data.notification_type = summary_line.indexOf("Contamination") === -1 ? NotificationType.Normal : NotificationType.Contamination;
                notifications.push(model.data);
            }
            this.setHighWaterMark(i);

            console.timeEnd(`${process.env.pm_id}-${this._file_type}`);
            ddLogger.verbose(`${method_name} - End results = `, notifications);
            return notifications;
        } catch (err) {
            ddLogger.error(`${method_name} - Failed parsing. Error=`, err);
            return [];
        }
    }

    private getLineTime(line: string): number {
        if (!line) return 0;
        const first = line.substring(0, 19);

        return moment.utc(first, "DD-MM-YYYY HH:mm:ss").unix() * 1000;
    }
}