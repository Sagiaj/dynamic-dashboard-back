import FileReader from "../../utilities/file-reader";
import IFileParserStrategy from "../contracts/file-parser";
import ExperimentLogDataEntity from "../entities/experiment";

import ExperimentLogsFileParserStrategy from "../parsers/experiment-log";

import BaseFileData from "./base";

export default class ExperimentsFileData extends BaseFileData {

    constructor(parser_strategy: IFileParserStrategy = new ExperimentLogsFileParserStrategy()) {
        super(parser_strategy);
    }

    async load(): Promise<ExperimentsFileData> {
        const directory_path = `${Globals.system_logs.base_path}/${Globals.system_logs.log_types.experiments.path}`;
        const filename_regex = Globals.system_logs.log_types.experiments.filename_regex;
        const read_stream = await FileReader.getFileStream(directory_path, new RegExp(filename_regex), 1024 * 10 * 10);
        let entities: ExperimentLogDataEntity[];
        
        this.getFileParserStrategy().setFileReadStream(read_stream);
        entities = await this.getFileParserStrategy().parse();
        read_stream.close();

        this.setFileData(entities);

        return this;
    }
}