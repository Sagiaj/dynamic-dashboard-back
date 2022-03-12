import MongoConnector from '../utilities/mongo-connector';
import { Collection, ClientSession, Db, Sort, Document } from 'mongodb';
import { Collections, CollectionsRevert, MongoCollection } from '../models/collections';

export default class MongodbProvider {

    static async queryMongoCollectionDistinct(collection_type: Collections, distinct_key: string, filter: object, client_connection?: Db) {
        try {
            const mongoClient = client_connection || await MongoConnector.getInstance();
            const targetCol = mongoClient.collection(CollectionsRevert[collection_type]);

            return await targetCol.distinct(distinct_key, filter);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    static async insertMongoObject(insertion_object: any, collection_type: MongoCollection, client_connection?: Db) {
        try {
            const mongoClient = client_connection || await MongoConnector.getInstance();
            const targetCol = mongoClient.collection(CollectionsRevert[collection_type]);

            return await targetCol.insertOne(insertion_object);
        } catch (err) {
            return Promise.reject(err);
        }
    }
    
    static async insertMongoObjectsList(insertion_objects: any[], collection_type: MongoCollection, client_connection?: Db) {
        try {
            const mongoClient = client_connection || await MongoConnector.getInstance();
            const targetCol = mongoClient.collection(CollectionsRevert[collection_type]);

            return await targetCol.insertMany(insertion_objects);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    static async upsertMongoObject<FilterObject, UpdateObject>(filter_object: FilterObject, upsert_object: UpdateObject, collection_type: MongoCollection, client_connection?: Db) {
        try {
            const mongoClient = client_connection || await MongoConnector.getInstance();
            const targetCol = await mongoClient.collection(CollectionsRevert[collection_type]);
            const completeMergedObject = { ...filter_object, ...upsert_object };

            return await targetCol.updateOne(filter_object, { $set: completeMergedObject }, { upsert: true });
        } catch (err) {
            return Promise.reject(err);
        }
    }

    static async queryMongoCollection(filter_object: object, collection_type: MongoCollection, sort_criterias: Sort, limit: number | null, projection: object | null, client_connection?: Db) {
        try {
            const mongoClient = client_connection || await MongoConnector.getInstance();
            const targetCol = await mongoClient.collection(CollectionsRevert[collection_type]);

            let docRef = await targetCol.find(filter_object);
            if (sort_criterias) docRef = docRef.sort(sort_criterias);
            if (projection) docRef = docRef.project(projection);
            if (limit) docRef = docRef.limit(limit)

            return docRef.toArray();
        } catch (err) {
            return Promise.reject(err);
        }
    }

    static async getMongoObject<T, P extends T>(filter_object: P, collection_type: MongoCollection, additional_projection?: object, client_connection?: Db) {
        try {
            const mongoClient = client_connection || await MongoConnector.getInstance();
            const targetCol = await mongoClient.collection(CollectionsRevert[collection_type]);

            const res = await targetCol.findOne(filter_object, { projection: { ...additional_projection } });
            if (!res) {
                ddLogger.error(`Could not find a document matching filter: ${JSON.stringify(filter_object, null, 4)}`);
                return null;
            }
            return <P>res;
        } catch (err) {
            return Promise.reject(err);
        }
    }

    static async deleteMongoObject(filter_object: any, collection_type: MongoCollection, client_connection?: Db) {
        try {
            const mongoClient = client_connection || await MongoConnector.getInstance();
            const targetCol = await mongoClient.collection(CollectionsRevert[collection_type]);

            return await targetCol.deleteOne(filter_object, (err, result) => {
                if (err) {
                    console.log("Failed to delete mongo object. Error:", err);
                    return Promise.reject(err);
                }
                return result;
            });
        } catch (err) {
            return Promise.reject(err);
        }
    }

    static async insertCollectionObject(insertion_object: any, targetCol: Collection, session?: ClientSession) {
        try {
            return await targetCol.insertOne(insertion_object, session ? { session } : {});
        } catch (err) {
            return Promise.reject(err);
        }
    }

    static async upsertCollectionObject(upsert_object: any, targetCol: Collection) {
        try {
            return await targetCol.updateOne(upsert_object, { $set: upsert_object }, { upsert: true });
        } catch (err) {
            return Promise.reject(err);
        }
    }

    static async aggregateCollection(match_object: any, collection_type: MongoCollection, aggregation_pipeline: object[], client_connection?: Db): Promise<Document[]> {
        const method_name = `MongoDBProvider/aggregateCollection`;
        ddLogger.info(`${method_name} - start`);
        try {
            const mongoClient = client_connection || await MongoConnector.getInstance();
            const targetCol = await mongoClient.collection(CollectionsRevert[collection_type]);
            const amended_pipeline = [{ $match: match_object }, ...aggregation_pipeline];
            
            ddLogger.verbose(`${method_name} - amended_pipeline=`, JSON.stringify(amended_pipeline, null, 4));
            const results = await targetCol.aggregate(amended_pipeline, { allowDiskUse: true });
            const array_result = await results.toArray();
            ddLogger.verbose(`${method_name} - done. results==`, JSON.stringify(array_result, null, 4));
            return array_result;
        } catch (err) {
            ddLogger.error(`${method_name} - Failed aggegating collection. Error=`, err);
            throw err;
        }
    }
}
