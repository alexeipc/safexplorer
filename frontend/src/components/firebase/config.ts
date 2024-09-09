import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getDatabase, Database } from "firebase/database"
import { getAuth, Auth } from "firebase/auth"
import dotenv from "dotenv"

dotenv.config();

export class Firebase {
    private app: FirebaseApp;

    constructor() {
        const firebaseConfig = {
            apiKey: process.env.FIREBASE_APIKEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            databaseURL: process.env.FIREBASE_DB_URL,
            projectId: process.env.FIREBASE_PROJ_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSANGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            measurementId: process.env.FIREBASE_MEASUREMENTID
        };
        console.log(firebaseConfig);
        this.app = initializeApp(firebaseConfig);
        
    }

    getAuth(): Auth {
        return getAuth(this.app);
    }

    getApp(): FirebaseApp {
        return this.app;
    }

    getAnalytics(): Analytics {
        return getAnalytics(this.app);
    }

    getDatabase(): Database {
        return getDatabase(this.app);
    }
}