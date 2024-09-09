import { APICall } from "./APICall";

export class CrimeMapLoad extends APICall {
    constructor() {
        super();
    }

    async getCrimeData(rec: any):Promise<any[]> {
        let a = await this.postRequest('/load-crime-map', rec);
        return a;
    }
}