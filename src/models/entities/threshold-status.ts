import BaseEntityData from "./base";
export enum SystemStatuses {
    USB = "Live Processing",
    Folder = "Offline processing"
}
export type SystemStatus = SystemStatuses;

export interface IThresholdStatusLogDataEntity {
    threshold: number;
    system_status: SystemStatus;
    image_multiplier: number;
    sum_over_factor: number;
    timestamp: number;
}

export default class ThresholdStatusLogDataEntity extends BaseEntityData<IThresholdStatusLogDataEntity> {
    protected __data: IThresholdStatusLogDataEntity = {
        threshold: 0,
        system_status: SystemStatuses.USB,
        image_multiplier: 0,
        sum_over_factor: 1,
        timestamp: 0
    };

    constructor() {
        super();
    }
}
