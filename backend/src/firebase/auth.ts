import { FirebaseInteraction } from "./FirebaseInteraction";
import { createUserWithEmailAndPassword, AuthError } from "firebase/auth"
import { sanitizeEmail } from "../utils/auth";

export interface UserData {
    email: string
    fullName: string
    lastLogin: Date
    role: string
    plans: any[]
}

export class Auth extends FirebaseInteraction{
    authorized: boolean = true;
    constructor() {
        super("users")
    }
    validateEmail(email: string): boolean {
        return true;
    }
    validatePassword(password: string): boolean {
        return true;
    }
    async register(email: string, password: string, data: UserData): Promise<void> {
        // TODO: implement validated password and username
        try {
            await createUserWithEmailAndPassword(this.auth, email, password);
            
            email = sanitizeEmail(email)
            console.log(email);
            this.save(email, data)
            console.log("User created")
        } catch (error: any) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    console.log(`Email address ${email} already in use.`);
                    break;
                case 'auth/invalid-email':
                    console.log(`Email address ${email} is invalid.`);
                    break;
                case 'auth/operation-not-allowed':
                    console.log(`Error during sign up.`);
                    break;
                case 'auth/weak-password':
                    console.log('Password is not strong enough. Add additional characters including special characters and numbers.');
                    break;
                default:
                    console.log(error.message);
                    break;
            }
        }
    }
}