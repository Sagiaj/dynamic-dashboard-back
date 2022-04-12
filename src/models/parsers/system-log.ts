import moment from "moment";
import IFileParserStrategy from "../contracts/file-parser";
import { FileType } from "../enums/file-types";
import { ReadStream } from "fs";
import BaseFileParserStrategy from "./base";
import FileReader from "../../utilities/file-reader";
import SystemLogDataEntity, { DetectionSize, ISystemLogDataEntity, ObjectType, ObjectTypeDetection } from "../entities/system-log-data";

export default class SystemLogsFileParserStrategy extends BaseFileParserStrategy implements IFileParserStrategy {
    protected _file_type: FileType = FileType.SystemLog;

    constructor(read_stream?: ReadStream) {
        super(read_stream);
    }

    async parse(): Promise<ISystemLogDataEntity[]> {
        const method_name = `SystemLogsFileParserStrategy/parse`;
        ddLogger.info(`${method_name} - start`);
        try {
            const upper_threshold = moment().utc().endOf("day").unix() * 1000;
            const lower_threshold = this._last_highwater_mark;
            const readStream = this.getFileReadStream();
            const lines = await FileReader.createLineReaderStream(readStream);
            const detections: ISystemLogDataEntity[] = [];
            let lineTime: number;
    
            console.time(`${process.env.pm_id}-${this._file_type}`);
            let i = -1;
            for await (let summary_line of lines) {
                i++;
                if (lower_threshold && i <= lower_threshold) { continue; }
                if (summary_line.indexOf(Globals.system_logs.log_formats.live_data.summary_indicator) !== -1 || summary_line === "") continue;
                if (summary_line.indexOf(Globals.system_logs.log_formats.live_data.detections_indicator) !== -1) {
                    const last_idx = detections.length === 0 ? detections.length : detections.length - 1;
                    const detection = detections[last_idx];
                    const detection_summary_strings = (<string>summary_line).split(/Detections per type:\s+(\-\d+\s+)?/g).filter(s => !!s).map(s => s.trim());
                    if (!detection_summary_strings) continue;
                    let object_type_detection = null;
                    for (let summary_idx = 0, detection_idx = 0; summary_idx < detection_summary_strings.length; ++summary_idx) {
                        let summary_string = detection_summary_strings[summary_idx];
                        if (summary_string && Number(summary_string.trim()) <= 0) continue;
                        object_type_detection = detection.object_type_detections[detection_idx];
                        if (object_type_detection) {
                            this.addDetections(object_type_detection, summary_string);
                            ++detection_idx;
                        }
                    }
                    continue;
                }

                
                lineTime = this.getLineTime(summary_line);
                const after_upper_threshold: boolean = !lineTime || (lineTime > upper_threshold);
                const before_lower_threshold: boolean = !lineTime || (lineTime < lower_threshold);
                if ( after_upper_threshold || before_lower_threshold  ) continue;
    
                const systemLogDataEntity = new SystemLogDataEntity();
                systemLogDataEntity.data.timestamp = lineTime;

                const data_entity = this.populateObjectTypeDetections(systemLogDataEntity.data, summary_line);
                detections.push(data_entity);
            }

            this.setHighWaterMark(i);
    
            console.timeEnd(`${process.env.pm_id}-${this._file_type}`);
            ddLogger.verbose(`${method_name} - End results = `, detections);
            return detections;
        } catch (err) {
            ddLogger.error(`${method_name} - Failed parsing. Error=`, err);
            return [];
        }
    }

    private getLineTime(line: string): number {
        if (!line) return 0;
        const first = line.substring(0, 19);

        return moment(first, "DD-MM-YYYY HH:mm:ss").unix() * 1000;
    }

    private addDetections(object_type_detection: ObjectTypeDetection, summary_line: string): ObjectTypeDetection {
        const detections_str = summary_line.trim();
        for (let j = 0, detection_idx = 0; j < detections_str.length; j++) {
            let detection_number = "";
            while (j < detections_str.length && DigitStringsMap[detections_str[j]] === true) {
                detection_number += detections_str[j];
                j++;
            }
            const detection_type = new DetectionSize(detection_idx);
            detection_type.amount = Number(detection_number);
            object_type_detection.detection_size_distribution.push(detection_type);
            detection_idx++;
        }
        return object_type_detection;
    }
    
    private populateObjectTypeDetections(data: ISystemLogDataEntity, line: string): ISystemLogDataEntity {
        const method_name = `SystemLogsFileParserStrategy/populateDetectionTypes`;
        try {
            const type_detections: string[] = <string[]>(<string>line).match(/Number of (\w+) detected:\s*(\-?\d)+\s*/g);

            for (let detection_type of type_detections) {
                let detections_string = detection_type.trim();
                const object_type: ObjectType = detections_string.split(/Number of /g)[1].trim().split(/\s+/g)[0].trim();
                if (object_type) {
                    const number_of_detections = Number(detections_string.split(":")[1].trim());
                    if (number_of_detections <= 0) continue;
                    const current_detection = new ObjectTypeDetection();
                    current_detection.type = object_type;
                    current_detection.total = number_of_detections;
                    data.object_type_detections.push(current_detection);
                }
            }
            return data;
        } catch (err) {
            ddLogger.error(`${method_name} - failed populating detection types. Error=`, err);;
            throw err;
        }
    }
}

const DigitStringsMap: { [key: string]: boolean } = {};
for (let n = 0; n < 10; n++) { DigitStringsMap[n] = true; }
