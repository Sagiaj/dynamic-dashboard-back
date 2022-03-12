import { cancelJob, scheduleJob } from "node-schedule";

export default class TaskSchedulerProvider {
    static async scheduleTask(cron_expression: string, job_name: string, callback: any) {
        const method_name = `TaskSchedulerProvider/scheduleTask`;
        ddLogger.info(`${method_name} - start`);
        try {
            scheduleJob(job_name, cron_expression, callback)
            ddLogger.info(`${method_name} - end`);
        } catch (err) {
            ddLogger.info(`${method_name} - error. Error=`, err);
        }
    }
    
    static async cancelTaskScheduling(job_name: string) {
        const method_name = `TaskSchedulerProvider/cancelTaskScheduling`;
        ddLogger.info(`${method_name} - start`);
        try {
            ddLogger.verbose(`${method_name} = calling TaskSchedulerProvider/cancelTaskScheduling`);
            cancelJob(job_name);
            ddLogger.info(`${method_name} - end`);
        } catch (err) {
            ddLogger.info(`${method_name} - error. Error=`, err);
        }
    }
}
