import React, { Component } from 'react';
import L from 'leaflet';
import { OSMSearchAmenity } from "../osm/SearchAmenity";
import { Rectangle } from "./MapLoadingQuadtree";
import { StateLocator } from "./StatesBoundary";

const LARGEST_HEIGHT = 6;
const LOWEST_HEIGHT = 4;

interface AmenitySearchingQuadtreeProps {
    map: L.Map;
}

interface AmenitySearchingQuadtreeState {
    abortController: AbortController | null;
    currentQuery: string;
}

export class AmenitySearchingQuadtree extends Component<AmenitySearchingQuadtreeProps, AmenitySearchingQuadtreeState> {
    private searchAmenitiesAPI: OSMSearchAmenity;

    constructor(props: AmenitySearchingQuadtreeProps) {
        super(props);
        this.state = {
            abortController: null,
            currentQuery: "",
        };
        this.searchAmenitiesAPI = new OSMSearchAmenity();
    }

    componentWillUnmount() {
        if (this.state.abortController) {
            this.state.abortController.abort();
        }
    }

    async get(center: number[], query: string): Promise<any> {
        if (query.length <= 3) return null;

        const boundary = StateLocator.getState(center[0], center[1]);
        if (!boundary) {
            console.error("Unable to determine state boundary for center point:", center);
            return null;
        }

        // Cancel any ongoing task
        if (this.state.abortController) {
            this.state.abortController.abort();
        }

        // Create a new AbortController
        const newAbortController = new AbortController();
        this.state = { abortController: newAbortController, currentQuery: query };

        const root = new Rectangle([boundary.minY, boundary.minX], [boundary.maxY, boundary.maxX]);
        return this.getAmenities(center, root, query, 0, newAbortController.signal);
    };

    getAmenities = async (point: number[], rec: Rectangle, query: string, height: number, signal: AbortSignal): Promise<any[] | null> => {
        const drawRectangle = (rec: Rectangle) => {
            const southWest: L.LatLngTuple = [rec.topLeft[0], rec.topLeft[1]];
            const northEast: L.LatLngTuple = [rec.bottomRight[0], rec.bottomRight[1]];

            if (this.props.map)
                L.rectangle([southWest, northEast], { color: "red", weight: 1 }).addTo(this.props.map);
        };

        if (signal.aborted) {
            console.log(`Query "${query}" aborted`);
            return null;
        }

        if (height === LARGEST_HEIGHT) {
            let amenities = await this.searchAmenitiesAPI.getPlaces(rec, ["restaurant"], query);

            if (signal.aborted) {
                console.log(`Query "${query}" aborted after search`);
                return null;
            }

            if (amenities && amenities.length > 0) {
                amenities = amenities.map((amenity: any) => ({
                    ...amenity,
                    distance: this.calculateDistance(point, [amenity.lat, amenity.lon])
                })).sort((a: any, b: any) => a.distance - b.distance);

                drawRectangle(rec);
            }

            return amenities;
        } else {
            const midX = (rec.topLeft[0] + rec.bottomRight[0]) / 2;
            const midY = (rec.topLeft[1] + rec.bottomRight[1]) / 2;

            const topLeftRec = new Rectangle(rec.topLeft, [midX, midY]);
            const topRightRec = new Rectangle([midX, rec.topLeft[1]], [rec.bottomRight[0], midY]);
            const bottomLeftRec = new Rectangle([rec.topLeft[0], midY], [midX, rec.bottomRight[1]]);
            const bottomRightRec = new Rectangle([midX, midY], rec.bottomRight);

            let amenities: any[] | null;

            if (topLeftRec.contains(point)) {
                amenities = await this.getAmenities(point, topLeftRec, query, height + 1, signal);
            } else if (topRightRec.contains(point)) {
                amenities = await this.getAmenities(point, topRightRec, query, height + 1, signal);
            } else if (bottomLeftRec.contains(point)) {
                amenities = await this.getAmenities(point, bottomLeftRec, query, height + 1, signal);
            } else {
                amenities = await this.getAmenities(point, bottomRightRec, query, height + 1, signal);
            }

            if (signal.aborted) {
                console.log(`Query "${query}" aborted during recursive search`);
                return null;
            }

            if (amenities == null || amenities.length > 0) return amenities;

            if (height >= LOWEST_HEIGHT) 
                amenities = await this.searchAmenitiesAPI.getPlaces(rec, ["restaurant"], query);

            if (signal.aborted) {
                console.log(`Query "${query}" aborted after secondary search`);
                return null;
            }

            if (amenities && amenities.length > 0) {
                amenities = amenities.map((amenity: any) => ({
                    ...amenity,
                    distance: this.calculateDistance(point, [amenity.lat, amenity.lon])
                })).sort((a: any, b: any) => a.distance - b.distance);

                drawRectangle(rec);
            }

            return amenities;
        }
    };

    calculateDistance(point1: number[], point2: number[]): number {
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
    };

    render() {
        return null; // This component does not render anything on its own
    }
}