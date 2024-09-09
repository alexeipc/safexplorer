import { LatLng } from "leaflet";
import { APICall } from "./APICall";

export class SearchPlaces extends APICall {
    constructor() {
        super();
    }

    getCoordinate(name: string): [number, number] {
        return [37.615223, -122.389977];
    }
}