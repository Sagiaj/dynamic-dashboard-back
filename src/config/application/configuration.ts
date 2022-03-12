import IApplicationLoader from "../../models/contracts/bootstrap/loader";

export default class ApplicationConfiguration implements IApplicationLoader {
    private static __config: typeof Globals;
    private static __instance: ApplicationConfiguration;

    private constructor() {}

    static getInstance(): ApplicationConfiguration {
        if (!this.__instance) {
            this.__instance = new ApplicationConfiguration()
        }

        return this.__instance;
    }

    async init(local_config_path?: string) {
        if (!ApplicationConfiguration.__config) {
            const configurationFile = require(process.cwd() + "/config.json");
            (<any>global).Globals = configurationFile;
            ApplicationConfiguration.__config = Globals;
        }

        return this;
    }
}
