import { FileType } from "../enums/file-types";
import BaseEntityData from "./base";
import CartridgeEntity, { ICartridgeEntityData } from "./cartridge";
import SystemLogDataEntity, { ISystemLogDataEntity } from "./system-log-data";

export type EntityMappings = {
    [FileType.SystemLog]: ISystemLogDataEntity;
    [FileType.Cartridge]: ICartridgeEntityData;
};

export type FactoryTypes = {
    [K in FileType]: K extends keyof EntityMappings ? EntityMappings[K] : any;
}

export default class EntityDataFactory {
    static create<T extends keyof EntityMappings>(entity_type: T): BaseEntityData<EntityMappings[T]> {
        const method_name = `EntityDataFactory/create`;
        ddLogger.info(`${method_name} - start`);
        try {
            let entity: BaseEntityData<any>;

            switch (entity_type) {
                case FileType.Cartridge:
                    entity = new CartridgeEntity(0, 0);
                    break;
                case FileType.SystemLog:
                    entity = new SystemLogDataEntity();
                    break;
                default:
                    throw new Error(`Could not find type '${entity_type}'.`)
            }

            return entity;
        } catch (error) {
            ddLogger.error(`${method_name} Failed creating an entity data object. Error=`, error);
            throw error;
        }
    }
}