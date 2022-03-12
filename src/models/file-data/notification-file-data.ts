import FileReader from "../../utilities/file-reader";
import IFileParserStrategy from "../contracts/file-parser";
import NotificationLogDataEntity from "../entities/notification";
import NotificationLogsFileParserStrategy from "../parsers/notification-log";

import BaseFileData from "./base";

export default class NotificationFileData extends BaseFileData {

    constructor(parser_strategy: IFileParserStrategy = new NotificationLogsFileParserStrategy()) {
        super(parser_strategy);
    }

    async load(): Promise<NotificationFileData> {
        const directory_path = `${Globals.system_logs.base_path}/${Globals.system_logs.log_types.notifications.path}`;
        const filename_regex = Globals.system_logs.log_types.notifications.filename_regex;
        const read_stream = await FileReader.getFileStream(directory_path, new RegExp(filename_regex), 1024 * 10 * 10);
        let entities: NotificationLogDataEntity[];
        
        this.getFileParserStrategy().setFileReadStream(read_stream);
        entities = await this.getFileParserStrategy().parse();
        read_stream.close();

        this.setFileData(entities);

        return this;
    }
}