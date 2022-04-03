import moment from "moment";
import IFileParserStrategy from "../contracts/file-parser";
import { FileType } from "../enums/file-types";
import { ReadStream } from "fs";
import BaseFileParserStrategy from "./base";
import FileReader from "../../utilities/file-reader";
import ThresholdStatusLogDataEntity, { IThresholdStatusLogDataEntity, SystemStatuses } from "../entities/threshold-status";

export default class ThresholdStatusLogsFileParserStrategy extends BaseFileParserStrategy implements IFileParserStrategy {
    protected _file_type: FileType = FileType.ThresholdStatus;

    constructor(read_stream?: ReadStream) {
        super(read_stream);
    }

    async parse(): Promise<IThresholdStatusLogDataEntity[]> {
        const method_name = `ThresholdStatusLogsFileParserStrategy/parse`;
        ddLogger.info(`${method_name} - start`);
        try {
            const lower_threshold = this._last_highwater_mark;
            const readStream = this.getFileReadStream();
            const lines = await FileReader.createLineReaderStream(readStream);
            const threshold_status: IThresholdStatusLogDataEntity[] = [];

            console.time(`${process.env.pm_id}-${this._file_type}`);
            const model = new ThresholdStatusLogDataEntity();
            model.data.timestamp = moment().utc().unix() * 1000;
            let i = -1;
            for await (const summary_line of lines) {
                i++;
                if (i <= lower_threshold) { continue; }
                switch (i) {
                    case 0:
                        model.data.threshold = Number(summary_line.trim());
                        break;
                    case 1:
                        const isOnline = summary_line.indexOf("USB") >= 0;
                        model.data.system_status = isOnline ? SystemStatuses.USB : SystemStatuses.Folder;
                        break;
                    case 2:
                        model.data.image_multiplier = Number(summary_line.trim());
                        break;
                    default:
                        break;
                }
            }
            threshold_status.push(model.data);
            this.setHighWaterMark(-1);

            console.timeEnd(`${process.env.pm_id}-${this._file_type}`);
            ddLogger.verbose(`${method_name} - End results = `, threshold_status);
            return threshold_status;
        } catch (err) {
            ddLogger.error(`${method_name} - Failed parsing. Error=`, err);
            return [];
        }
    }
}