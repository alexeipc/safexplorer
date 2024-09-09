import axios, { CancelTokenSource } from 'axios';
import { Rectangle } from '../models/MapLoadingQuadtree';

export class OSMSearchAmenity {
    private overpassURL: string;
    private cancelTokenSource: CancelTokenSource | null;

    constructor() {
        this.overpassURL = 'http://overpass-api.de/api/interpreter';
        this.cancelTokenSource = null;
    }

    async getPlaces(rectangle: Rectangle, amenities: string[], query: string): Promise<any> {
        // Cancel the previous request if it exists
        if (this.cancelTokenSource) {
            this.cancelTokenSource.cancel('New request made, cancelling the previous one.');
        }

        // Create a new cancel token for the current request
        this.cancelTokenSource = axios.CancelToken.source();

        const bbox = `${rectangle.topLeft[0]},${rectangle.topLeft[1]},${rectangle.bottomRight[0]},${rectangle.bottomRight[1]}`;

        let node = "(";
        amenities.forEach((amenity: string) => {
            node += `node["amenity"="${amenity}"]["name"~"${query}", i](${bbox});
                    way["amenity"="${amenity}"]["name"~"${query}", i](${bbox});
                    relation["amenity"="${amenity}"]["name"~"${query}", i](${bbox});
            `;
        });
        node += ");";

        const overpassQuery = `
            [out:json][timeout:25];
            ${node}
            out body;
            >;
            out skel qt;
        `.trim();

        try {
            const response = await axios.get(this.overpassURL, {
                params: { data: overpassQuery },
                cancelToken: this.cancelTokenSource.token
            });
            const data = response.data;

            const places = data.elements.map((element: any) => {
                if (element.tags && element.tags['addr:city'] && element.tags.name) {
                    return {
                        id: element.id,
                        name: element.tags?.name,
                        lat: element.lat,
                        lon: element.lon,
                        address: `${element.tags['addr:housenumber'] ? element.tags['addr:housenumber'] + ' ' : ''}${element.tags['addr:street'] ? element.tags['addr:street'] + ' ' : ''} ${element.tags['addr:city']} ${element.tags['addr:state']}`,
                        tags: element.tags
                    };
                } else {
                    return {
                        id: element.id,
                        name: element.tags?.name,
                        lat: element.lat,
                        lon: element.lon,
                        tags: element.tags
                    };
                }
            }).filter((element: any) => element.tags?.name && element.lat !== undefined && element.lon !== undefined);

            return places;
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Previous request canceled:', error.message);
            } else {
                console.error('Error fetching data from Overpass API:', error);
            }
            return [];
        }
    }
}
