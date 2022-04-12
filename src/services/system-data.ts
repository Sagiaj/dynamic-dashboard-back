import moment from "moment";
import { ObjectId } from "mongodb";
import { AggregationPipelines } from "../models/aggregation-pipelines";
import { Collections } from "../models/collections";
import { NotificationType } from "../models/entities/notification";
import MongodbProvider from "../providers/mongodb-provider";
import FileReader from "../utilities/file-reader";

const class_name = "SystemDataService";
export default class SystemDataService {
    static async getHourlyObjectAverage(time_from?: number) {
        const method_name = `${class_name}/getHourlyObjectAverage`;
        ddLogger.info(`${method_name} - start`);
        try {
          if (!time_from) {
            time_from = moment().utc().subtract(10, "hours").unix() * 1000;
          }
          const aggregation_pipeline = AggregationPipelines.HourlyAverage;
          ddLogger.verbose(`${method_name} - calling MongodbProvider/aggregateCollection`);
          const results = await MongodbProvider.aggregateCollection({ "timestamp": { "$gte": time_from, "$lte": moment.utc().endOf("day").unix() * 1000 }}, Collections.SystemLogs, aggregation_pipeline);
          ddLogger.verbose(`${method_name} - results=`, results);

          ddLogger.verbose(`${method_name} - calling SystemDataService/getThresholdStatus`);
          const system_start_data = await SystemDataService.getThresholdStatus();
          const sum_over = Number(system_start_data.sum_over_factor) || 1;
          const multiplier = Number(system_start_data.multiplier) || 100;

          ddLogger.info(`${method_name} - end`);
          return results.sort((a,b)=> b.hour - a.hour).map(hourly_rows => {
            hourly_rows.unitPerML = ( ( 62500 / hourly_rows.count * multiplier) * hourly_rows.sum ) / sum_over;
            return hourly_rows;
          });
        } catch (err) {
            ddLogger.error(`${method_name} - Failed getting hourly average. Error=`, err);
            throw err;
        }
    }
    
    static async getTotalDetectionsByType(time_from?: number) {
        const method_name = `${class_name}/getTotalDetectionsByType`;
        ddLogger.info(`${method_name} - start`);
        try {
          if (!time_from) {
            time_from = moment().utc().subtract(10, "hours").unix() * 1000;
          }
          const aggregation_pipeline = AggregationPipelines.DetectionsByType;
          ddLogger.verbose(`${method_name} - calling MongodbProvider/aggregateCollection`);
          const results = await MongodbProvider.aggregateCollection({ "timestamp": { "$gte": time_from, "$lte": moment.utc().endOf("day").unix() * 1000 }}, Collections.SystemLogs, aggregation_pipeline);
          ddLogger.verbose(`${method_name} - results=`, results);
          ddLogger.info(`${method_name} - end`);
          return results.sort((a: any, b: any) => {
            const str_a = `${a._id.type}${a.detection_type[0]}${a.total}`;
            const str_b = `${b._id.type}${b.detection_type[0]}${b.total}`;
            if (str_a < str_b) return -1;
            if (str_a > str_b) return 1;
            return 0;
          });
        } catch (err) {
            ddLogger.error(`${method_name} - Failed getting total detections. Error=`, err);
            throw err;
        }
    }
    
    static async getDetections(time_from: number, time_to: number, limit: number) {
        const method_name = `${class_name}/getDetections`;
        ddLogger.info(`${method_name} - start`);
        ddLogger.verbose(`${method_name} - input params:`, { time_from, time_to, limit });
        try {
          if (!time_from) {
            time_from = moment().utc().startOf("day").unix() * 1000;
          }
          if (!time_to) {
            time_to = moment().utc().endOf("day").unix() * 1000;
          }

          ddLogger.verbose(`${method_name} - calling MongodbProvider/aggregateCollection`);
          // const system_logs = await MongodbProvider.queryMongoCollection({ timestamp: { $gte: time_from, $lte: time_to } }, Collections.SystemLogs, {}, null, null);
          const system_logs = await MongodbProvider.aggregateCollection({ timestamp: { $gte: time_from, $lte: time_to } }, Collections.SystemLogs, [
            {
              $bucketAuto: {
                groupBy: "$timestamp",
                buckets: limit || 1000,
                output: {
                  timestamp: {"$min": "$timestamp"},
                  object_type_detections: { "$first": "$object_type_detections" }
                }
              }
            }
          ]);
          const system_start_data = await SystemDataService.getThresholdStatus();
          const multiplier = Number(system_start_data.image_multiplier) || 100;
          const time_series: any = { timestamps: {} };
          for (let system_log of system_logs) {
            if (!system_log.object_type_detections) { continue; }
            for (let detection of system_log.object_type_detections) {
              const object_type = detection.type;

              if (!time_series[object_type]) time_series[object_type] = [];
              time_series.timestamps[system_log["timestamp"]] = true;
              time_series[object_type].push({ timestamp: system_log["timestamp"], amount: detection["total"] * multiplier });
            }
          }
          ddLogger.info(`${method_name} - end`);
          return time_series;
        } catch (err) {
            ddLogger.error(`${method_name} - Failed getting detections. Error=`, err);
            throw err;
        }
    }
    
    static async getExperiments(time_from: number, experiment_type: string | undefined, result_min: number | string | undefined, result_max: number | string | undefined) {
        const method_name = `${class_name}/getExperiments`;
        ddLogger.info(`${method_name} - start`);
        ddLogger.verbose(`${method_name} - params:`, { time_from, experiment_type, result_min, result_max });
        try {
          const past365_days_unix_ts = moment().utc().startOf("day").subtract(365, "days").unix() * 1000;
          if (!time_from) {
            time_from = past365_days_unix_ts;
          } else if (time_from < past365_days_unix_ts) {
            ddLogger.error(`${method_name} - time_from is more than 365 days in the past`);
            throw new Error("ERROR_EXPERIMENT_PAST_365_DAYS");
          }

          const filter_object: { [key: string]: any; } = { timestamp: { $gte: time_from } };
          if (experiment_type) {
            filter_object["A"] = experiment_type;
          }

          if (result_min) { filter_object["Total Particles"] = { "$gte": `${result_min}` }; }
          if (result_max) { filter_object["Total Particles"] = { "$lte": `${result_max}` }; }
          
          ddLogger.verbose(`${method_name} - calling MongodbProvider/queryMongoCollection`);
          const results = await MongodbProvider.queryMongoCollection(filter_object, Collections.ExperimentLogs, {}, null, null);
          ddLogger.verbose(`${method_name} - results=`, results);
          ddLogger.info(`${method_name} - end`);
          return results;
        } catch (err) {
            ddLogger.error(`${method_name} - Failed getting experiments. Error=`, err);
            throw err;
        }
    }
    
    static async getExperimentAlerts() {
        const method_name = `${class_name}/getExperimentAlerts`;
        ddLogger.info(`${method_name} - start`);
        try {
          ddLogger.verbose(`${method_name} - calling MongodbProvider/queryMongoCollection`);
          const experiment_flags: any = await MongodbProvider.queryMongoCollection({ start_of_day_ts: moment().utc().startOf("day").unix() * 1000 }, Collections.ExperimentFlags, {}, null, null);
          ddLogger.verbose(`${method_name} - result experiment_flags=`, experiment_flags[0]);
          ddLogger.verbose(`${method_name} - calling MongodbProvider/queryMongoCollection`);
          const flagged = await MongodbProvider.queryMongoCollection({ "Total Particles": { $gte: String(experiment_flags[0]["threshold"]) } }, Collections.ExperimentLogs, {}, null, null);
          ddLogger.verbose(`${method_name} - results=`, flagged);
          ddLogger.info(`${method_name} - end`);
          return flagged;
        } catch (err) {
            ddLogger.error(`${method_name} - Failed getting experiment alerts. Error=`, err);
            throw err;
        }
    }
    
    static async flagExperimentThreshold(threshold: number | string) {
        const method_name = `${class_name}/flagExperimentThreshold`;
        ddLogger.info(`${method_name} - start`);
        try {
          ddLogger.verbose(`${method_name} - calling MongodbProvider/queryMongoCollection`);
          const experiment_flags: any = await MongodbProvider.upsertMongoObject(
            { start_of_day_ts: moment().utc().startOf("day").unix() * 1000 },
            { threshold: String(threshold) },
            Collections.ExperimentFlags
          );
          ddLogger.verbose(`${method_name} - results=`, experiment_flags);
          ddLogger.info(`${method_name} - end`);
          return experiment_flags;
        } catch (err) {
            ddLogger.error(`${method_name} - Failed setting daily experiment threshold. Error=`, err);
            throw err;
        }
    }

    static async getDailyExperimentThreshold(): Promise<any> {
      const method_name = `${class_name}/getDailyExperimentThreshold`;
      ddLogger.info(`${method_name} - start`);
      try {
        ddLogger.verbose(`${method_name} - calling MongodbProvider/queryMongoCollection`);
        const experiment_flags: any = await MongodbProvider.queryMongoCollection({ start_of_day_ts: moment().utc().startOf("day").unix() * 1000 }, Collections.ExperimentFlags, {}, null, null);
        return experiment_flags;
      } catch (err) {
        ddLogger.error(`${method_name} - failed getting daily experiment threshold. Error=`, err);
      }
    }
    
    static async getLastNotifications(limit: number = 5): Promise<any> {
      const method_name = `${class_name}/getLastNotifications`;
      ddLogger.info(`${method_name} - start`);
      try {
        ddLogger.verbose(`${method_name} - calling MongodbProvider/queryMongoCollection`);
        const experiment_flags: any = await MongodbProvider.queryMongoCollection({ notification_type: NotificationType.Contamination }, Collections.NotificationLogs, { timestamp: -1 }, limit, null);
        return experiment_flags;
      } catch (err) {
        ddLogger.error(`${method_name} - failed getting daily experiment threshold. Error=`, err);
      }
    }
    
    static async getThresholdStatus(limit: number = 5): Promise<any> {
      const method_name = `${class_name}/getThresholdStatus`;
      ddLogger.info(`${method_name} - start`);
      try {
        ddLogger.verbose(`${method_name} - calling MongodbProvider/queryMongoCollection`);
        const threshold_status: any = await MongodbProvider.queryMongoCollection({ timestamp: { $gte: moment().utc().startOf("day").unix() * 1000, $lte: moment().utc().endOf("day").unix() * 1000 } }, Collections.ThresholdStatusLogs, { timestamp: -1 }, 1, null);
        ddLogger.verbose(`${method_name} - results=`, threshold_status);
        return threshold_status[0];
      } catch (err) {
        ddLogger.error(`${method_name} - failed getting daily experiment threshold. Error=`, err);
      }
    }
    
    static async getCartridgeDates(time_from: number, time_to: number): Promise<any> {
      const method_name = `${class_name}/getCartridgeDates`;
      ddLogger.info(`${method_name} - start`);
      try {
        const query_object_start: any = { start_ts: { $ne: "" } };
        const query_object_end: any = { end_ts: { $ne: "" } };
        if (time_from) {
          const id_from = ObjectId.createFromTime(time_from / 1000);
          query_object_start._id = { $gte: id_from };
          query_object_end._id = { $gte: id_from };
        }
        if (time_to) {
          const id_to = ObjectId.createFromTime(time_to / 1000);
          if (!query_object_start._id) query_object_start._id = {};
          if (!query_object_end._id) query_object_end._id = {};
          query_object_start._id["$lte"] = id_to;
          query_object_end._id["$lte"] = id_to;
        }
        ddLogger.verbose(`${method_name} - calling MongodbProvider/queryMongoCollection`);
        const cartridge_latest_start: any = await MongodbProvider.queryMongoCollection(query_object_start, Collections.CartridgeLogs, { start_ts: -1 }, 1, null);
        const cartridge_latest_end: any = await MongodbProvider.queryMongoCollection(query_object_end, Collections.CartridgeLogs, { end_ts: -1 }, 1, null);
        const latest_start_ts = cartridge_latest_start && cartridge_latest_start[0] && cartridge_latest_start[0].start_ts;
        const latest_end_ts = cartridge_latest_end && cartridge_latest_end[0] && cartridge_latest_end[0].end_ts;
        return { cartridge_latest_start: latest_start_ts, cartridge_latest_end: latest_end_ts, left_until_finish: 30 - moment().utc().diff(moment(latest_start_ts), "days") };
      } catch (err) {
        ddLogger.error(`${method_name} - failed getting cartridge dates range. Error=`, err);
      }
    }
    
    static async getSystemMode(): Promise<any> {
      const method_name = `${class_name}/getSystemMode`;
      ddLogger.info(`${method_name} - start`);
      try {
        const system_mode_file_path = `${Globals.system_logs.base_path}/${Globals.system_logs.log_types.system_mode.path}`
        const filename_regex = Globals.system_logs.log_types.system_mode.filename_regex;
        const file_data = FileReader.readFile(system_mode_file_path, new RegExp(filename_regex)).toString("utf-8");

        return file_data;
      } catch (err) {
        ddLogger.error(`${method_name} - failed getting daily experiment threshold. Error=`, err);
        throw err
      }
    }
}