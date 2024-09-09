import { circle } from "@turf/turf";
import { ICrime } from "../plugins/ICrimeDataPlugin";
import { serverCache } from "./Cache";

export interface SafetyScoreCacheValue {
    overallSafetyScore: number;
    crimes?: ICrime[];
    timeStamp: Date;
}

/**
 * A service to get and set the value to the cache
 */
export class SafetyScoreCachingService {
    DURATION_IN_SECONDS = 60 * 60 * 24; // One day

    /**
     * Check if the given date is still valid
     * @param date the given date
     * @returns true if the given date is concurrent
     */
    private checkConcurrency(date: Date) : boolean {
        let currentDate = new Date().getTime();
        let differenceInSeconds = (currentDate - date.getTime()) / 1000;

        if (differenceInSeconds < this.DURATION_IN_SECONDS) return true;
        else return false;
    }

    /**
     * Get the data about the given zip code
     * @param zipCode the given zip code
     * @returns the data about that zip code if exists
     */
    async get(zipCode: number) : Promise<SafetyScoreCacheValue | null> {
        let key: string = `zipcode_safety_score_${zipCode}`;

        let value: SafetyScoreCacheValue = await serverCache.get(key);

        if (value == null) return null;

        if (this.checkConcurrency(value.timeStamp)) return value;
        else {
            serverCache.remove(key);
            return null;
        }
    }

    /**
     * Get the data for the given zip code with the given overall score and the list of crimes
     * @param zipCode the given zip code
     * @param overallSafetyScore the overall safety score
     * @param crimes the given list of crime
     */
    async set(zipCode: number, overallSafetyScore: number, crimes?: ICrime[]) {
        let key: string = `zipcode_safety_score_${zipCode}`;

        serverCache.set(key, {
            overallSafetyScore: overallSafetyScore,
            crimes: crimes,
            timeStamp: new Date(),
        })
    }
}