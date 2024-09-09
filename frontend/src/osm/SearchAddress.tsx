import axios, { AxiosInstance, CancelTokenSource } from "axios";

export class OSMSearchAddress {
    private axiosInstance: AxiosInstance;
    private cancelTokenSource: CancelTokenSource | null = null;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: "https://nominatim.openstreetmap.org",
            timeout: 10000,
        });
    }

    public async getAddress(point: number[], query: string): Promise<any> {
        try {
            if (this.cancelTokenSource) {
                this.cancelTokenSource.cancel();
            }
            this.cancelTokenSource = axios.CancelToken.source();

            const endpoint = `search?q=${encodeURIComponent(query)}&format=json`;
            const response = await this.axiosInstance.get(endpoint, {
                cancelToken: this.cancelTokenSource.token
            });

            let addresses = response.data;

            console.log(addresses);

            // Calculate distance to the point and sort by distance
            addresses = addresses.map((address: any) => ({
                ...address,
                subscript: address.addresstype,
                distance: this.calculateDistance(point, [address.lat, address.lon]),
                boundingbox: address.boundingbox,
            })).sort((a: any, b: any) => a.distance - b.distance);

            return addresses;
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log("Request was cancelled:", error.message);
            } else {
                console.error('There was an error with the request:', error);
            }
            return null;
        }
    }

    private calculateDistance(point1: number[], point2: number[]): number {
        const [lat1, lon1] = point1;
        const [lat2, lon2] = point2;

        const toRadians = (degrees: number) => degrees * (Math.PI / 180);

        const R = 6371e3; // Earth radius in meters
        const φ1 = toRadians(lat1);
        const φ2 = toRadians(lat2);
        const Δφ = toRadians(lat2 - lat1);
        const Δλ = toRadians(lon2 - lon1);

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c;
        return distance;
    }
}
