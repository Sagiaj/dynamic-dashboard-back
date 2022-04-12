import moment from "moment";
import IFileParserStrategy from "../contracts/file-parser";
import { FileType } from "../enums/file-types";
import { ReadStream } from "fs";
import BaseFileParserStrategy from "./base";
import FileReader from "../../utilities/file-reader";
import { IExperimentLogDataEntity } from "../entities/experiment";
import * as csv from "csv-parse";

export default class ExperimentLogsFileParserStrategy extends BaseFileParserStrategy implements IFileParserStrategy {
    private static __end_of_day = new Date();
    protected _file_type: FileType = FileType.Experiments;

    constructor(read_stream?: ReadStream) {
        super(read_stream);
    }

    static get utc_eod_threshold_ts() {
        if (Date.now() > ExperimentLogsFileParserStrategy.__end_of_day.getTime()) {
            const end_of_day_current = moment(undefined, true).endOf("day");
            ExperimentLogsFileParserStrategy.__end_of_day.setUTCDate(end_of_day_current.date());
            ExperimentLogsFileParserStrategy.__end_of_day.setUTCHours(23,59,59,999);
        }
        return ExperimentLogsFileParserStrategy.__end_of_day;
    }

    async parse(): Promise<IExperimentLogDataEntity[]> {
        const method_name = `ExperimentLogsFileParserStrategy/parse`;
        ddLogger.info(`${method_name} - start`);
        try {
            const lower_threshold = this._last_highwater_mark;
            const readStream = this.getFileReadStream();
            const lines = await FileReader.createLineReaderStream(readStream);
            const experiments: IExperimentLogDataEntity[] = [];
            let lineTime: number;
    
            console.time(`${process.env.pm_id}-${this._file_type}`);
            let i = -1;
            let buff = Buffer.from("");
            for await (const summary_line of lines) {
                i++;
                if (i > 1 && lower_threshold >= i) { continue; }
                buff = Buffer.concat([buff, Buffer.from(summary_line + "\n")]);
            }
            
            const records: any[] = await new Promise((resolve, reject) => {
                try {
                    csv.parse(buff.toString().split("\n").slice(1).join("\n"), {delimiter: ",", columns: true}, (err, records) => {
                        if (err) {
                            ddLogger.error(`${method_name} - failed parsing CSV. Error=`, err);
                            reject(err);
                        }
                        ddLogger.verbose(`${method_name} - Success parsing CSV`);
                        resolve(records);
                    })
                } catch (err) {
                    ddLogger.error(`${method_name} - failed parsing CSV. Error=`, err);
                    reject(err);
                }
            });
            for (let rec of records) {
                const hour = rec["TIME START"];
                const start_of_day = moment().startOf("day");
                const timestamp = moment(`${start_of_day.utc().format("YYYY-MM-DD")}T${hour}Z`).unix() * 1000;
                rec["timestamp"] = timestamp;
                experiments.push(rec);
            }
            this.setHighWaterMark(i);
    
            console.timeEnd(`${process.env.pm_id}-${this._file_type}`);
            ddLogger.verbose(`${method_name} - End results = `, experiments);
            return experiments;
        } catch (err) {
            ddLogger.error(`${method_name} - Failed parsing. Error=`, err);
            return [];
        }
    }
}