import { firebaseApp, Firebase } from "./config";
import { Database, ref, set, get, child, update } from "firebase/database"
import { Auth } from "firebase/auth"

/**
 * Firebase interaction service
 */
export class FirebaseInteraction {
    database: Database;                 // The target database
    collection: string;                 // The collection 
    auth: Auth;                         // The authentication (pass down to inherited class if needed)

    constructor(collection: string) {
        this.database = firebaseApp.getDatabase();
        this.collection = collection;
        this.auth = firebaseApp.getAuth()
    }

    /**
     * Save the given data to the given endpoint
     * @param endpoint the enpoint
     * @param data the data to be saved
     */
    save(endpoint: string, data: any) {
        set(ref(this.database, this.collection + '/' + endpoint), data);
    }

    /**
     * Update the given data of the given endpoint
     * @param endpoint the enpoint
     * @param data the data to be updated
     */
    update(endpoint: string, data: any) {
        const dbRef = ref(this.database);
        const updates:{[key: string]:any} = {};

        updates[this.collection + '/' + endpoint] = data;

        update(dbRef, updates)
    }

    /**
     * Get object based on its endpoint
     * @param endpoint the endpoint of the target
     * @returns the result we want to get
     */
    async getOne(endpoint: string):Promise<any> {
        let dbRef = ref(this.database);
        let snapshot = await get(child(dbRef, this.collection + '/' + endpoint));

        if (snapshot.exists()) {
            return snapshot.val();
        }
        else return null;
    }
}