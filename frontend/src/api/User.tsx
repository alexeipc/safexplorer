import { APICall } from "./APICall";

export class User extends APICall {
    constructor() {
        super();
    }

    async signUp(fullName: string, email: string, password: string) {
        const data = {
            fullName: fullName,
            email: email,
            password: password
        }

        await this.postRequest("/user/register", data)
    }
}