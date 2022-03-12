import { Collections, CollectionsRevert } from "../../models/collections";
import MongodbProvider from "../../providers/mongodb-provider";
import MongoConnector from "../../utilities/mongo-connector";

export default class LogService {
    static async saveLogs(execution_results: any[], log_type: CollectionsRevert) {
        const method_name = "LogService/saveLogs";
        ddLogger.info(`${method_name} - start`);
        ddLogger.verbose(`${method_name} - execution results length:`, execution_results.length);
        try {
            const mongoClient = await MongoConnector.getInstance();
            const results = await MongodbProvider.insertMongoObjectsList(execution_results, Collections[log_type], mongoClient);
            ddLogger.info(`${method_name} - end`);
            return results;
        } catch (err) {
            ddLogger.error(`${method_name} - Error. err=`, err);
            throw err;
        }
    }
}