import IFileParserStrategy from "../contracts/file-parser";
import { FileType } from "../enums/file-types";
import BaseFileParserStrategy from "./base";
import { ReadStream } from "fs";
import CartridgeEntity, { ICartridgeEntityData } from "../entities/cartridge";
import FileReader from "../../utilities/file-reader";

export default class CartridgeFileParserStrategy extends BaseFileParserStrategy implements IFileParserStrategy {
    protected _file_type: FileType = FileType.Cartridge;
    constructor(read_stream?: ReadStream) {
        super(read_stream);
    }

    async parse(): Promise<ICartridgeEntityData[]> {
        const method_name = `CartridgeFileParserStrategy/parse`;
        ddLogger.info(`${method_name} - start`);
        try {
            let cartridge_data: ICartridgeEntityData[] = [];
            const lower_threshold = this._last_highwater_mark;
            const readStream = this.getFileReadStream();
            const lines = await FileReader.createLineReaderStream(readStream);

            console.time(`${process.env.pm_id}-${this._file_type}`);
            let i = -1;
            let fileStartOfDayTs = 0;
            for await (let cartridge_line of lines) {
                i++;
                if (i <= lower_threshold) { continue; }
                if (!cartridge_line || cartridge_line.length < 20) { continue; }

                const [date,month,year,hours,minutes] = cartridge_line.match(/\d+/g);
                const lineTime = Date.UTC(parseInt(year),parseInt(month)-1,parseInt(date),parseInt(hours),parseInt(minutes));

                let start = 0, end = 0;
                if (cartridge_line.indexOf(Globals.system_logs.log_formats.cartridge.start_indicator) === 0) {
                    start = lineTime;
                } else if (cartridge_line.indexOf(Globals.system_logs.log_formats.cartridge.end_indicator) === 0) {
                    end = lineTime;
                }

                if (lineTime > fileStartOfDayTs) { fileStartOfDayTs = lineTime; }
                const model = new CartridgeEntity(start, end);
                cartridge_data.push(model.data);
            }
            this.setHighWaterMark(i);

            console.timeEnd(`${process.env.pm_id}-${this._file_type}`);
            ddLogger.verbose(`${method_name} - End results = `, cartridge_data);
            return cartridge_data;
        } catch (err) {
            ddLogger.error(`${method_name} - Failed parsing. Error=`, err);
            return [];
        }
    }
}