export default abstract class BaseEntityData<EntityDataType> {
    protected abstract __data: EntityDataType;
    protected constructor() {}

    get data(): EntityDataType {
        return this.__data;
    }

    populateFrom(entity_data: any): BaseEntityData<EntityDataType> {
        return this;
    }
}
