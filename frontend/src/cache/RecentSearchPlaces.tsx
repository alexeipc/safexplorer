import { Mutex } from "../threadControl/Mutex";
import { CacheStoring } from "./CacheStoring";

const MAX_CACHE_LENGTH = 10;

export interface RecentSearchPlace {
    display_name: string;
    subscript?: string;
    lat: number;
    lon: number;
}

export class RecentSearchPlaces extends CacheStoring {
    private mutex = new Mutex();

    constructor() {
        super('recent-search');
    }

    async getArray() {
        let stringData: string | null = await this.getData();
        let currentData: RecentSearchPlace[] = [];

        if (stringData) currentData = JSON.parse(stringData);

        return currentData;
    }

    async add(data: any) {
        const unlock = await this.mutex.lock();

        try {
            let stringData: string | null = await this.getData();
            let currentData: RecentSearchPlace[] = [];

            if (stringData) {
                currentData = JSON.parse(stringData);
            }

            const exists = currentData.some((item: RecentSearchPlace) => 
                item.lat === data.lat && 
                item.lon === data.lon && 
                item.display_name === data.display_name);

            if (!exists) {
                if (currentData.length >= MAX_CACHE_LENGTH) {
                    currentData.shift();
                }

                currentData.push(data);
                this.saveData(currentData);
            }
        }
        finally {
            unlock();
        }
    }
}