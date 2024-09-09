import { LatLng } from "leaflet";
import { APICall } from "./APICall";

export interface SafetyScoreResponse {
    overall: number;
}
export class SafetyScore extends APICall {
    constructor() {
        super();
    }

    async getSafetyScore(latlng: LatLng): Promise<SafetyScoreResponse> {
        let data = {
            point: [latlng.lat, latlng.lng],
        }
        let response = await this.postRequest("safety-score", data)
        console.log(response);
        let res: SafetyScoreResponse = {overall: response.safetyScore};
        return res;
    }
}