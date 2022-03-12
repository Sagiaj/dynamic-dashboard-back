import { TaskType } from "../models/enums/task-types";

export type LoggerFn = (...args: any[]) => void;

interface DDLogger {
    info: LoggerFn;
    error: LoggerFn;
    verbose: LoggerFn;
    silly: LoggerFn;
}

interface BaseGlobalConfig {
    ddLogger: DDLogger;
}

interface ScheduledTaskInstructions {
    task_type: TaskType;
    cron_expression: string;
}

interface FilePathDetails {
    path: string;
    filename_regex: string;
    filename_regex_copy: string;
}

interface LogFileTypes {
    notifications: FilePathDetails;
    cartridge: FilePathDetails;
    live_data: FilePathDetails;
    experiments: FilePathDetails;
    threshold_status: FilePathDetails;
}

interface NotificationsFileFormat {
    
}

interface CartridgeFileFormat {
    start_indicator: string;
    end_indicator: string;
}

interface SystemLogFileFormat {
    detections_indicator: string;
    summary_indicator: string;
}

interface ExperimentsFileFormat {
    
}


interface LogFormats {
    notifications: NotificationsFileFormat;
    cartridge: CartridgeFileFormat;
    live_data: SystemLogFileFormat;
    experiments: ExperimentsFileFormat;
}

interface ConfigOptions extends BaseGlobalConfig {
    mongo_config: {
        db_name: string;
        connection_string: string;
        mongo_collections: {
            SYSTEM_LOGS: string;
            MAPPING_COL: string;
            CONFIG_COL: string;
            INSTRUCTIONS_COL: string;
            REVISIONS_COL: string;
            USERS_COL: string;
        };
    };
    SERVER_PORT: number;
    SERVER_URL: string;
    SERVER_WHITELIST: string[];
    mongo_connections: {
        [key: string]: any;
    };
    scheduled_tasks: ScheduledTaskInstructions[];
    system_logs: {
        base_path: string;
        log_types: LogFileTypes;
        log_formats: LogFormats
    }
}

type GlobalConfigType = ConfigOptions;

declare global {
    export let Globals: GlobalConfigType;

    export let ddLogger: DDLogger;

}
