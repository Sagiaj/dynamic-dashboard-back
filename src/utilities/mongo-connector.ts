import { MongoClient, Db } from 'mongodb';

export const buildConnectionString = (): string[] => {
    const connectionString = Globals.mongo_config.connection_string;
    const [dbNameOverride] = (connectionString.match(/authSource=\w+/g) || []).map((r: string) => r ? r.replace("authSource=", "") : r);
    return [connectionString, dbNameOverride];
};

class MongoConnector {
    private static instance: Db;
    private static mongo_client: MongoClient;

    static async getInstance(): Promise<Db> {
        if (!MongoConnector.instance) {
            try {
                await MongoConnector.initializeMongoInstance();
                return MongoConnector.instance;
            } catch (err) {
                console.log('Errored in MongoConnector', err);
                return Promise.reject(err);
            }
        } else {
            return MongoConnector.instance;
        }
    }

    static async getMongoClient(): Promise<MongoClient> {
        try {
            if (!MongoConnector.mongo_client) {
                const [connectionString, dbNameOverride] = buildConnectionString();
                let connection = await MongoClient.connect(connectionString, { maxPoolSize: 10 });
                MongoConnector.mongo_client = connection;
            }
            return MongoConnector.mongo_client;
        } catch (err) {
            return Promise.reject(err);
        }
    }

    private static async initializeMongoInstance(): Promise<void> {
        try {
            let connection = await this.getMongoClient();
            MongoConnector.instance = connection.db(Globals.mongo_config.db_name);
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

export default MongoConnector;
