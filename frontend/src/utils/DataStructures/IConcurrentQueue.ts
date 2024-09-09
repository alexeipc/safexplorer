/**
 * An interface that present a thread-safe queue 
 * It must be guarantee that when one of the contained methods is called, no methods should be called at the same time
 */
export interface IConcurrentQueue<T> {
    length: number;                             // The length of the queue
    /**
     * The method to enqueue a given element
     * @param element the element to push in
     */
    enqueue(element: T) : Promise<void>;
    /**
     * Return if the queue containing any element
     * @returns true if the queue is empty
     */
    isEmpty(): Promise<boolean>;
    /**
     * Return the top of the queue and remove it from the queue
     * @returns the top of the queue
     */
    dequeue(): Promise<T | null>;
}