import { NextFunction, Request, Response } from "express";
import SystemDataService from "../../services/system-data";

const class_name = `ExperimentsController`;
export default class ExperimentsController {
    static async getExperiments(req: Request, res: Response, next: NextFunction) {
        const method_name = `${class_name}/getExperiments`;
        ddLogger.info(`${method_name} - start`);
        try {
            let { time_from, experiment_type, result_min, result_max } = <any>{ ...req.query, ...req.params };
            console.log("CHECK PARAMS RAW", { time_from, experiment_type, result_min, result_max });
            ddLogger.verbose(`${method_name} - calling SystemDataService/getExperiments`);
            const results = await SystemDataService.getExperiments(Number(time_from) || 0, experiment_type, result_min, result_max);
            ddLogger.info(`${method_name} - end`);
            return res.send(results);
        } catch (err) {
            ddLogger.error(`${method_name} - Failed getting experiments. Error=`, err);
            return next(err);
        }
    }
    
    static async getExperimentAlerts(req: Request, res: Response, next: NextFunction) {
        const method_name = `${class_name}/getExperimentAlerts`;
        ddLogger.info(`${method_name} - start`);
        try {
            ddLogger.verbose(`${method_name} - calling SystemDataService/getExperimentAlerts`);
            const results = await SystemDataService.getExperimentAlerts();
            ddLogger.info(`${method_name} - end`);
            return res.send(results);
        } catch (err) {
            ddLogger.error(`${method_name} - Failed getting experiment alerts. Error=`, err);
            return next(err);
        }
    }

    static async flagExperimentThreshold(req: Request, res: Response, next: NextFunction) {
        const method_name = `${class_name}/flagExperimentThreshold`;
        ddLogger.info(`${method_name} - start`);
        try {
            const threshold = req.body["threshold"] || null;
            if (!threshold || !Number.isInteger(Number(threshold))) {
                ddLogger.error(`${method_name} - Invalid experiment threshold = ${threshold}`);
                throw new Error("ERROR_INVALID_EXPERIMENT_THRESHOLD");
            }
            ddLogger.verbose(`${method_name} - calling SystemDataService/flagExperimentThreshold`);
            const results = await SystemDataService.flagExperimentThreshold(threshold);
            ddLogger.info(`${method_name} - end`);
            return res.send(results);
        } catch (err) {
            ddLogger.error(`${method_name} - Failed setting daily experiment threshold. Error=`, err);
            return next(err);
        }
    }
    
    static async getDailyExperimentThreshold(req: Request, res: Response, next: NextFunction) {
        const method_name = `${class_name}/getDailyExperimentThreshold`;
        ddLogger.info(`${method_name} - start`);
        try {
            ddLogger.verbose(`${method_name} - calling SystemDataService/getDailyExperimentThreshold`);
            const results = await SystemDataService.getDailyExperimentThreshold();
            ddLogger.info(`${method_name} - end`);
            return res.send(results);
        } catch (err) {
            ddLogger.error(`${method_name} - Failed setting daily experiment threshold. Error=`, err);
            return next(err);
        }
    }
}