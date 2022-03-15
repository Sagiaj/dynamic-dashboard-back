import { NextFunction, Request, Response } from "express";
import SystemDataService from "../../services/system-data";

const class_name = `SystemController`;
export default class SystemController {
    static async getThresholdStatus(req: Request, res: Response, next: NextFunction) {
        const method_name = `${class_name}/getThresholdStatus`;
        ddLogger.info(`${method_name} - start`);
        try {
            const time_from = req.query.time_from;
            ddLogger.verbose(`${method_name} - calling SystemDataService/getThresholdStatus`);
            const results = await SystemDataService.getThresholdStatus(Number(time_from));
            ddLogger.info(`${method_name} - end`);
            return res.send(results);
        } catch (err) {
            ddLogger.error(`${method_name} - Failed getting hourly average. Error=`, err);
            return next(err);
        }
    }
    
    static async getCartridgeDates(req: Request, res: Response, next: NextFunction) {
        const method_name = `${class_name}/getCartridgeDates`;
        ddLogger.info(`${method_name} - start`);
        try {
            const time_from = req.query.time_from;
            ddLogger.verbose(`${method_name} - calling SystemDataService/getCartridgeDates`);
            const results = await SystemDataService.getCartridgeDates(Number(time_from));
            ddLogger.info(`${method_name} - end`);
            return res.send(results);
        } catch (err) {
            ddLogger.error(`${method_name} - Failed getting hourly average. Error=`, err);
            return next(err);
        }
    }
}
