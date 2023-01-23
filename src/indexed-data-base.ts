import { Schema } from './schema';

export class IndexedDataBase {

    private dbPromise!: (type: string) => Promise<IDBDatabase>;
    private schemas: Record<string, Schema>;

    constructor(private dbName: string, private version: number) {
        this.schemas = {};
        this.dbPromise = (type: string) => new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onerror = () => reject(request.error);
            if(type === 'readonly'){
                request.onsuccess = () => resolve(request.result);
            }else {
                request.onupgradeneeded = () => resolve(request.result);
            }
        }); 
    }

    public async createCollection(collectionName: string, schema: Schema){
        this.schemas[collectionName] = schema;
        const db = await this.dbPromise('write');
        if(!db.objectStoreNames.contains(collectionName)){
            const objectStore = db.createObjectStore(collectionName, { keyPath: schema.primaryKey });
            for(const field of Object.keys(schema.properties)){
                objectStore.createIndex(field, field, { unique: schema.properties[field].primary });
            }
        }
    }

    public async addData(collectionName: string, data: any): Promise<any>{
        if(!this.validateSchema(this.schemas[collectionName], data)) {
            throw new Error('Invalid data');
        }
        const db = await this.dbPromise('readonly');
        const tx = db.transaction(collectionName, 'readwrite');
        const store = tx.objectStore(collectionName).add(data);
        return new Promise((resolve, reject) => {
            store.onsuccess = () => resolve(store.result);
            store.onerror = () => reject(store.error);
        });
    }

    public async getData(collectionName: string, key: any): Promise<any>{
        const db = await this.dbPromise('readonly');
        const tx = db.transaction(collectionName, 'readonly');
        const store = tx.objectStore(collectionName).get(key);
        return new Promise((resolve, reject) => {
            store.onsuccess = () => resolve(store.result);
            store.onerror = () => reject(store.error);
        });
    }

    public async getAllData(collectionName: string): Promise<any[]>{
        const db = await this.dbPromise('readonly');
        const tx = db.transaction(collectionName, 'readonly');
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