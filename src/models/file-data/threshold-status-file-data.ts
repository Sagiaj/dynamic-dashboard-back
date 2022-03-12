import FileReader from "../../utilities/file-reader";
import IFileParserStrategy from "../contracts/file-parser";
import ThresholdStatusLogDataEntity from "../entities/threshold-status";
import ThresholdStatusLogsFileParserStrategy from "../parsers/threshold-status";

import BaseFileData from "./base";

export default class ThresholdStatusFileData extends BaseFileData {

    constructor(parser_strategy: IFileParserStrategy = new ThresholdStatusLogsFileParserStrategy()) {
        super(parser_strategy);
    }

    async load(): Promise<ThresholdStatusFileData> {
        const directory_path = `${Globals.system_logs.base_path}/${Globals.system_logs.log_types.threshold_status.path}`;
        const filename_regex = Globals.system_logs.log_types.threshold_status.filename_regex;
        const read_stream = await FileReader.getFileStream(directory_path, new RegExp(filename_regex), 1024 * 10 * 10);
        let entities: ThresholdStatusLogDataEntity[];
        
        this.getFileParserStrategy().setFileReadStream(read_stream);
        entities = await this.getFileParserStrategy().parse();
        read_stream.close();

        this.setFileData(entities);

        return this;
    }
}