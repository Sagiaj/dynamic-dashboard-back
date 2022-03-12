import * as routes from "../../routes";
import express, { Application } from "express";
import IApplicationLoader from "../../models/contracts/bootstrap/loader";
import ApplicationErrorHandler from "./error-handler";
import path from 'path';
import ApplicationServer from "./server";
import cors from "cors";

export default class ApplicationRouter implements IApplicationLoader {
    private static __instance: ApplicationRouter;
    private static __app: Application;

    private constructor(expressApp: Application) {
        ApplicationRouter.__app = expressApp;
    }

    private get app(): Application {
        return ApplicationRouter.__app;
    }

    static getInstance(): ApplicationRouter {
        if (!this.__instance) {
            this.__instance = new ApplicationRouter(ApplicationServer.getInstance().application);
        }

        return this.__instance;
    }

    async init(): Promise<Application> {
        try {
            ApplicationServer.getInstance().init();
            // this.app.use(cors({origin: "http://localhost:8080"}));
            this.app.use(cors({
                origin: (origin: any, callback: any) => {
                    if (origin == 'null') {
                        callback(null, true);
                        return;
                    }
                    if (!origin || Globals.SERVER_WHITELIST && Globals.SERVER_WHITELIST.indexOf(origin) !== -1) {
                        callback(null, true);
                    } else { callback(new Error('Not allowed by CORS')); }
                }
            }));
            this.app.use('/back/scheduling', routes.schedulingRoutes);
            this.app.use('/back/experiments', routes.experimentsRoutes);
            this.app.use('/back/notifications', routes.notificationsRoutes);
            this.app.use('/back/objects', routes.objectRoutes);
            this.app.use('/back/system', routes.systemRoutes);

            // Generic error handler
            this.app.use(ApplicationErrorHandler.wrapError);

            // Serves front end
            this.app.use(express.static(path.join(__dirname, '../../../..', 'dynamic-dashboard-front/dist')));

            // Serves front end as root path
            this.app.get('/', (req: any, res: any) => {
                res.sendFile(path.join(__dirname, '../../../..', 'dynamic-dashboard-front/dist/index.html'));
            });
            return this.app;
        } catch (err) {
            ddLogger.error("Could not initialize routes. Error=", err);
            throw err;
        }
    }
}