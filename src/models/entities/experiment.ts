import BaseEntityData from "./base";

export interface IExperimentLogDataEntity {
    timestamp: number;
}

export default class ExperimentLogDataEntity extends BaseEntityData<IExperimentLogDataEntity> {
    protected __data: IExperimentLogDataEntity = {
        timestamp: Date.now()
    };

    constructor() {
        super();
    }

    parseFrom(data: any) {
        
        return this;
    }
}
