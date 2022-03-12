import FileReader from "../../utilities/file-reader";
import IFileParserStrategy from "../contracts/file-parser";
import CartridgeEntity from "../entities/cartridge";
import CartridgeFileParserStrategy from "../parsers/cartridge";

import BaseFileData from "./base";

export default class CartridgeFileData extends BaseFileData {

    constructor(parser_strategy: IFileParserStrategy = new CartridgeFileParserStrategy()) {
        super(parser_strategy);
    }

    async load(): Promise<CartridgeFileData> {
        const directory_path = `${Globals.system_logs.base_path}/${Globals.system_logs.log_types.cartridge.path}`;
        const filename_regex = Globals.system_logs.log_types.cartridge.filename_regex;
        const read_stream = await FileReader.getFileStream(directory_path, new RegExp(filename_regex), 1024 * 10 * 10);
        let entities: CartridgeEntity[];
        
        this.getFileParserStrategy().setFileReadStream(read_stream);
        entities = await this.getFileParserStrategy().parse();
        read_stream.close();

        this.setFileData(entities);

        return this;
    }
}