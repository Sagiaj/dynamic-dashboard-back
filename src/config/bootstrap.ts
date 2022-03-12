import { Application } from "express";
import ApplicationConfiguration from "./application/configuration";
import ApplicationLogger from "./application/logger";
import ApplicationRouter from './application/route';
import ApplicationScheduler from "./application/scheduler";
import ApplicationServer from "./application/server";

export default class ApplicationBootstrap {
    private static __instance: ApplicationBootstrap;

    private constructor() {
        if (!ApplicationBootstrap.__instance) {
            ApplicationBootstrap.__instance = this;
        }
    }

    static async up(): Promise<Application> {
        const method_name = `ApplicationBootstrap/up`;
        
        console.log(`${method_name} - start`);
        try {
            const applicationRunsInPM2: boolean = process && process.env && (process.env.pm_id !== undefined);
            const processIsFirstProcessRunningInCluster: boolean = applicationRunsInPM2 && (process && process.env && process.env.pm_id && process.env.pm_id.toString() === "0") || false;

            const applicationLogger = ApplicationLogger.getInstance();
            const applicationConfiguration = ApplicationConfiguration.getInstance();
            const applicationServer = ApplicationServer.getInstance();
            const applicationRouter = ApplicationRouter.getInstance();
            const applicationScheduler = ApplicationScheduler.getInstance();

            // Load logger
            await applicationLogger.init();
            // Load global config
            await applicationConfiguration.init();
            // Load application routes
            await applicationRouter.init();

            if (applicationRunsInPM2) {
                ddLogger.verbose(`${method_name} - Application runs in a PM2 cluster. ID=${process.env.pm_id}`)
                if (processIsFirstProcessRunningInCluster) {
                    ddLogger.verbose(`${method_name} - First process running, initializing scheduler jobs.`)
                    applicationScheduler.init();
                }
            } else {
                applicationScheduler.init();
            }

            return applicationServer.application;
        } catch (bootstrap_error) {
            console.log(`${method_name} - Could not complete application bootstrap. Error=`, bootstrap_error);
            throw bootstrap_error;
        }
    }
}