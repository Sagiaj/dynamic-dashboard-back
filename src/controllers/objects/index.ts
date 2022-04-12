import { NextFunction, Request, Response } from "express";
import SystemDataService from "../../services/system-data";

const class_name = `ObjectsController`;
export default class ObjectsController {
    static async getHourlyObjectAverage(req: Request, res: Response, next: NextFunction) {
        const method_name = `${class_name}/getHourlyObjectAverage`;
        ddLogger.info(`${method_name} - start`);
        try {
            const time_from = req.query.time_from;
            ddLogger.verbose(`${method_name} - calling SystemDataService/getHourlyObjectAverage`);
            const results = await SystemDataService.getHourlyObjectAverage(Number(time_from));
            ddLogger.info(`${method_name} - end`);
            return res.send(results);
        } catch (err) {
            ddLogger.error(`${method_name} - Failed getting hourly average. Error=`, err);
            return next(err);
        }
    }
    
    static async getTotalDetectionsByType(req: Request, res: Response, next: NextFunction) {
        const method_name = `${class_name}/getTotalDetectionsByType`;
        ddLogger.info(`${method_name} - start`);
        try {
            const time_from = req.query.time_from;
            ddLogger.verbose(`${method_name} - calling SystemDataService/getTotalDetectionsByType`);
            const results = await SystemDataService.getTotalDetectionsByType(Number(time_from));
            ddLogger.info(`${method_name} - end`);
            return res.send(results);
        } catch (err) {
            ddLogger.error(`${method_name} - Failed getting hourly average. Error=`, err);
            return next(err);
        }
    }
    
    static async getDetections(req: Request, res: Response, next: NextFunction) {
        const method_name = `${class_name}/getDetections`;
        ddLogger.info(`${method_name} - start`);
        try {
            const time_from = req.query.time_from;
            const time_to = req.query.time_to;
            const limit = req.query.limit;
            ddLogger.verbose(`${method_name} - input params:`, { time_from, time_to, limit });
            ddLogger.verbose(`${method_name} - calling SystemDataService/getDetections`);
            const results = await SystemDataService.getDetections(Number(time_from), Number(time_to), Number(limit));
            ddLogger.info(`${method_name} - end`);
            return res.send(results);
        } catch (err) {
            ddLogger.error(`${method_name} - Failed getting hourly average. Error=`, err);
            return next(err);
        }
    }
}