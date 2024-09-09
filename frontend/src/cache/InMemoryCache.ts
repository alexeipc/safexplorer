import { Mutex } from "../utils/ThreadControllers/Mutex";
import { ICache } from "./ICache";

/**
 * An in memory cache with thread-safe functionalities
 * Allow multiple reading but only one editing
 * The database is locked when editing
 */
export class InMemoryCache implements ICache {
    dict: {[key: string] : any} = {}
    mutexLock: Mutex = new Mutex();

    /**
     * Check if the given key exists in the cache
     * @param key the given key
     * @returns true if the given key does exist
     */
    async contains(key: string): Promise<boolean> {
        // Wait for the editing lock to be released
        await this.mutexLock.untilLockIsReleased();
        return key in this.dict;
    }

    /**
     * Set the key with the given value
     * @param key the given key
     * @param value the value
     */
    async set(key: string, value: any): Promise<void> {
        const unlock = await this.mutexLock.lock(); 
        try {
            this.dict[key] = value
        }
        finally {
            unlock();
        }
    }
    
    /**
     * Return the value of the given key
     * @param key the given key
     * @return any the promise of the value of the given key
     */
    async get(key: string): Promise<any> {
        // Wait for the editing lock to be released
        await this.mutexLock.untilLockIsReleased();
        return this.dict[key];
    }
    
    /**
     * Remove the given key and its value from the cache
     * @param key the given key to remove
     */
    async remove(key: string): Promise<void> {
        const unlock = await this.mutexLock.lock(); 
        try {
            delete this.dict[key];
        }
        finally {
            unlock();
        }
    }
    
    /**
     * Return the size of the cache
     * @return number the size of the current cache
     */
    async size(): Promise<number> {
        // Wait for the editing lock to be released
        await this.mutexLock.untilLockIsReleased();
        return Object.keys(this.dict).length
    }
}
