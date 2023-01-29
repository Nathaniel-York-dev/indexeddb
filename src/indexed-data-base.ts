import { Schema } from './schema';

export class IndexedDataBase {

    private dbInstance!: IDBDatabase;
    private static schemas: Record<string, Schema> = {};

    constructor(private dbName: string, private version: number) {
        const request = indexedDB.open(this.dbName, this.version);
        request.onerror = () => console.log(request.error);
        request.onupgradeneeded = () => {
            const db = request.result;
            for(const collectionName of Object.keys(IndexedDataBase.schemas)){
                this.createCollection(collectionName, IndexedDataBase.schemas[collectionName], db);
            }
        };
        request.onsuccess = () => {
            this.dbInstance = request.result;
        }
    }

    public static registerCollection(collectionName: string, schema: Schema){
        IndexedDataBase.schemas[collectionName] = schema;
    }

    private async createCollection(collectionName: string, schema: Schema, db: IDBDatabase){
        if(!db.objectStoreNames.contains(collectionName)){
            const objectStore = db.createObjectStore(collectionName, { keyPath: schema.primaryKey });
            for(const field of Object.keys(schema.properties)){
                objectStore.createIndex(field, field, { unique: schema.properties[field].primary });
            }
        }
    }

    public async addData(collectionName: string, data: any): Promise<any>{
        if(!this.validateSchema(IndexedDataBase.schemas[collectionName], data)) {
            throw new Error('Invalid data');
        }
        
        const tx = this.dbInstance.transaction(collectionName, 'readwrite');
        const store = tx.objectStore(collectionName).add(data);
        return new Promise((resolve, reject) => {
            store.onsuccess = () => resolve(store.result);
            store.onerror = () => reject(store.error);
        });
    }

    public async getData(collectionName: string, key: any): Promise<any>{
        const tx = this.dbInstance.transaction(collectionName, 'readonly');
        const store = tx.objectStore(collectionName).get(key);
        return new Promise((resolve, reject) => {
            store.onsuccess = () => resolve(store.result);
            store.onerror = () => reject(store.error);
        });
    }

    public async getAllData(collectionName: string): Promise<any[]>{
        const tx = this.dbInstance.transaction(collectionName, 'readonly');
        const store = tx.objectStore(collectionName).getAll();
        return new Promise((resolve, reject) => {
            store.onsuccess = () => resolve(store.result);
            store.onerror = () => reject(store.error);
        });
    }


    private validateSchema(schema: Schema, data?: any){
        if(!schema) return false;
        for(const filed of schema.required){
            if(!data[filed]) return false;
        }
        for(const filed of Object.keys(data)){
            if(schema.properties[filed]){
                if(typeof data[filed] !== schema.properties[filed].type){
                    return false;
                }
            } else {
                return false;
            }
        }

        return true;
    }

}