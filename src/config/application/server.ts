import express, { Application } from "express";
import IApplicationLoader from "../../models/contracts/bootstrap/loader";

export default class ApplicationServer implements IApplicationLoader {
    private static __app: Application;
    private static __instance: ApplicationServer;
    private static __initialized: boolean;

    private constructor(expressApp: Application) {
        ApplicationServer.__app = expressApp;
    }

    get application(): Application {
        return ApplicationServer.__app;
    }

    static getInstance(): ApplicationServer {
        if (!this.__instance) {
            this.__instance = new ApplicationServer(express());
        }

        return this.__instance;
    }

    async init(): Promise<any> {
        const method_name = `ApplicationServer/init`;
        ddLogger.info(`${method_name} - start`);
        try {
            if (ApplicationServer.__initialized) {
                ddLogger.verbose(`${method_name} - Already initialized`);
                return this;
            }
            this.application.use(express.json());
            ApplicationServer.__initialized = true;
            return this;
        } catch (err) {
            ddLogger.error(`${method_name} - Failed to init application server. Error=`, err);
            throw err;
        }
    }
}