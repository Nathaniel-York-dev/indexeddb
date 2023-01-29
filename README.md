# Indexeddb
This library was created only to be used by members of 'steadfast developers', but if you find it and it helps you feel free to use it.

## Installation
```bash
npm install @steadfast-devs/indexeddb
```

## Usage
First you need to create a .schema file, this will describe the collection structure.
For example:
```javascript
//users.schema
import {Schema} from '@steadfast-devs/indexeddb';
export const UserSchema: Schema = {
  primaryKey: 'username',
  properties: {
    id: { type: 'string'},
    username: { type: 'string', primary: true },
    password: { type: 'string' },
  },
  required: ['username', 'password'],
};
```
Then you need to register the collections
```javascript
import { IndexedDataBase } from '@steadfast-devs/indexeddb';

// You need use the static method registerCollection 
IndexedDataBase.registerCollection('users', UserSchema);

// Then you can instantiate the IndexedDataBase class. You need to pass the database name and the version
const db = new IndexedDataBase('myDatabase', 1);
```

Now you can use the database
```javascript
//Create a new user
db.addData('users', {
    id: '1',
    username: 'myUsername', 
    password: 'myPassword'
});

//Get all users
db.getAllData('users').then(users => {
    console.log(users);
});

//Get a user by username
db.getData('users', 'myUsername').then(user => {
    console.log(user);
});
```

## Example Angular Service
```javascript
...
import { IndexedDataBase } from '@steadfast-devs/indexeddb';
import { UserSchema } from './user.schema';
@Injectable({
  providedIn: 'root'
})
export class dbServices{
    public instance: IndexedDataBase;
    constructor(){
        ...
        IndexedDataBase.registerCollection('users', UserSchema);
        ...
        this.instance = new IndexedDataBase('myDatabase', 1);
    }
}
```

## Version Notes
### 1.0.0-alpha.1.0.0 to 2.0.0-alpha.1.1.0
- Some methods were changed to be more intuitive
### example:
```javascript
// Before
// First we need to instantiate the database
import { IndexedDataBase } from '@steadfast-devs/indexeddb';
const db = new IndexedDataBase('myDatabase', 1);
// Then we need to create the collection
db.createCollection('users', UserSchema);

// After
// We need to register the collection first
import { IndexedDataBase } from '@steadfast-devs/indexeddb';
IndexedDataBase.registerCollection('users', UserSchema);
IndexedDataBase.registerCollection('task', TaskSchema);
...
// Then we can instantiate the database
const db = new IndexedDataBase('myDatabase', 1);
```