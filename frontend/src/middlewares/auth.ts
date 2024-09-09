import { Request, Response, NextFunction } from "express";
import { Middleware } from "./interface";
import { Auth } from "../firebase/auth";
import admin from "firebase-admin";
import fbServiceAccount from "../firebase/fbServiceAccountKey.json";

export class AuthMiddleware implements Middleware {
    auth: Auth;

    constructor() {
        this.auth = new Auth();
        admin.initializeApp({
            credential: admin.credential.cert(fbServiceAccount as unknown as admin.ServiceAccount),
            databaseURL: "https://safe-explorer-e4e6b-default-rtdb.firebaseio.com"
        });
    }
    getAction(req: Request, res: Response, next: NextFunction) {
        const authToken = req.headers.authtoken as string | undefined;
        if (!authToken) {
            res.status(403).send("Unauthorized");
            return;
        }
        admin.auth().verifyIdToken(authToken)
            .then((decodedToken) => {
                const uid = decodedToken.uid;
                admin.auth().getUser(uid).then((userRecord) => {
                        console.log("Successfully fetched user data:", userRecord.toJSON());
                        // send userRecord middleware to next route/API calls
                    })
                    .catch((error) => {
                        console.error("Error fetching user data:", error);
                    });
                next();
            }).catch((error) => {
                console.log("Error verifying token in middleware:", error);
                next();
            });
    }
}