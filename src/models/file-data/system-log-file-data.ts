import FileReader from "../../utilities/file-reader";
import SystemLogDataEntity from "../entities/system-log-data";
import BaseFileParserStrategy from "../parsers/base";
import SystemLogsFileParserStrategy from "../parsers/system-log";
import BaseFileData from "./base";

export default class SystemLogsFileData extends BaseFileData {

    constructor(parser_strategy: BaseFileParserStrategy = new SystemLogsFileParserStrategy()) {
        super(parser_strategy);
    }

    async load(): Promise<SystemLogsFileData> {
        const directory_path = `${Globals.system_logs.base_path}/${Globals.system_logs.log_types.live_data.path}`;
        const filename_regex = Globals.system_logs.log_types.live_data.filename_regex;
        const read_stream = await FileReader.getFileStream(directory_path, new RegExp(filename_regex), 1024 * 10 * 10);
        let entities: SystemLogDataEntity[];
        
        this.getFileParserStrategy().setFileReadStream(read_stream);
        entities = await this.getFileParserStrategy().parse();
        read_stream.close();

        this.setFileData(entities);

        return this;
    }
    
}