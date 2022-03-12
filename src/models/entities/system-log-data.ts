import moment from "moment";
import { ObjectId } from "mongodb";
import BaseEntityData from "./base";

export enum DetectionTypeGroupSizes {
    ZeroToThreeML,
    ThreeToSixML,
    SixToNineML,
    NineToTwelveML,
    TwelveToFifteenML
}

export type ObjectType = string;
export type SystemLogDataParticles = number[];

export class ObjectTypeDetection {
    type: ObjectType = "";
    total: number = 0;
    detection_size_distribution: DetectionSize[] = [];
};

export class DetectionSize {
    _id: ObjectId;
    amount: number = 0;
    min_size_ml: number;
    max_size_ml: number;

    constructor(size: DetectionTypeGroupSizes, default_group_size: number = 3) {
        this._id = new ObjectId();
        this.min_size_ml = size * default_group_size;
        this.max_size_ml = (size * default_group_size) + default_group_size;
    }

    setMinSizeML(size: number) {
        this.min_size_ml = size;
    }

    setMaxSizeML(size: number) {
        this.max_size_ml = size;
    }
}

export interface ISystemLogDataEntity {
    _id: ObjectId;
    timestamp: number;
    bacteria_detected: number;
    object_type_detections: ObjectTypeDetection[];
}

export default class SystemLogDataEntity extends BaseEntityData<ISystemLogDataEntity> {
    protected __data: ISystemLogDataEntity = {
        _id: new ObjectId(),
        // timestamp: Date.now(),
        timestamp: moment().utc().unix() * 1000,
        bacteria_detected: 0,
        object_type_detections: []
    };

    constructor() {
        super();
    }
}
