import { NextFunction, Request, Response } from "express";
import SystemDataService from "../../services/system-data";

const class_name = "NotificationsController";
export default class NotificationsController {
    static async getLastNotifications(req: Request, res: Response, next: NextFunction) {
        const method_name = `${class_name}/getLastNotifications`;
        ddLogger.info(`${method_name} - start`);
        try {
            let { limit } = <any>{ ...req.query, ...req.params };
            ddLogger.verbose(`${method_name} - calling SystemDataService/getLastNotifications`);
            const results = await SystemDataService.getLastNotifications(Number(limit) || 5);
            ddLogger.info(`${method_name} - end`);
            return res.send(results);
        } catch (err) {
            ddLogger.error(`${method_name} - Failed setting daily experiment threshold. Error=`, err);
            return next(err);
        }
    }
}
