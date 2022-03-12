import BaseEntityData from "./base";

export enum NotificationType {
    Contamination = "contamination",
    Normal = "normal"
}

export interface INotificationLogDataEntity {
    notification_type: NotificationType;
    timestamp: number;
}

export default class NotificationLogDataEntity extends BaseEntityData<INotificationLogDataEntity> {
    protected __data: INotificationLogDataEntity = {
        notification_type: NotificationType.Normal,
        timestamp: 0
    };

    constructor() {
        super();
    }

    parseFrom(data: any) {
        this.data.notification_type = data["notification_type"];
        return this;
    }
}
