export interface ICache {
    /**
     * Check if the cache contains the given key
     * @param key the given key
     * @return if the cache contains the given key
     */
    contains(key: string) : Promise<boolean>;
    /**
     * Set the value for the given key
     * @param key the given key
     * @param value the given value
     */
    set(key: string, value: any): Promise<void>;
    /**
     * Get the value of the given key
     * @param key the given key
     * @return the value of the given key
     */
    get(key: string): Promise<any>;
    /**
     * Remove the value of the given key
     * @param key the given key
     */
    remove(key: string): Promise<void>;
    /**
     * Get the size of the cache
     */
    size(): Promise<number>;
}