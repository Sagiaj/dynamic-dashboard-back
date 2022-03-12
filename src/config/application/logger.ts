import IApplicationLoader from "../../models/contracts/bootstrap/loader";
import { DDLogger } from "../../typings"

export default class ApplicationLogger implements IApplicationLoader {
    private static __logger: DDLogger;
    private static __instance: ApplicationLogger;

    private constructor() {}

    static getInstance(): ApplicationLogger {
        if (!this.__instance) {
            this.__instance = new ApplicationLogger()
        }

        return this.__instance;
    }

    async init() {
        if (!ApplicationLogger.__logger) {
            ApplicationLogger.__logger = {
                error: console.error,
                info: console.log,
                verbose: console.log,
                silly: console.log
            };

            (<any>global).ddLogger = ApplicationLogger.__logger;
            ddLogger.info("Application Logger initialized successfully");
        } else {
            ddLogger.info("Application Logger has already been initialized.")
        }
        
    }
}

