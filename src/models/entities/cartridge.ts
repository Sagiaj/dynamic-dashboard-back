import BaseEntityData from "./base";

export interface ICartridgeEntityData {
    start_ts: number;
    end_ts: number;
}

export default class CartridgeEntity extends BaseEntityData<ICartridgeEntityData> {
    protected __data: ICartridgeEntityData = {
        start_ts: 0,
        end_ts: 0
    };

    constructor(start: number, end: number) {
        super();
        if (start) {
            this.data.start_ts = start;
        }
        if (end) {
            this.data.end_ts = end;
        }
    }
}
