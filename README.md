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
Then you need to inizialize the database, and pass the schema to the createCollection method
```javascript
import { IndexedDataBase } from '@steadfast-devs/indexeddb';

//The constructor takes the name of the database and the version
const db = new IndexedDataBase('myDatabase', 1);

//The createCollection method takes the name of the collection and the schema
db.createCollection('users', UserSchema);
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