export enum Collections {
  SystemLogs = "system_logs",
  Detections = "detections",
  CartridgeLogs = "cartridge_logs",
  NotificationLogs = "notification_logs",
  ThresholdStatusLogs = "threshold_status_logs",
  ExperimentLogs = "experiment_logs",
  ExperimentFlags = "experiment_flags",
  TaskExecutions = "task_executions"
}

export enum CollectionsRevert {
  system_logs = "SystemLogs",
  detections = "Detections",
  cartridge_logs = "CartridgeLogs",
  notification_logs = "NotificationLogs",
  threshold_status_logs = "ThresholdStatusLogs",
  experiment_logs = "ExperimentLogs",
  experiment_flags = "ExperimentFlags",
  task_executions = "TaskExecutions"
}

export type MongoCollection = keyof typeof CollectionsRevert;
