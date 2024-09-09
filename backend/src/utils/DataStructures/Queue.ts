import { Mutex } from "../ThreadControllers/Mutex";
import { IConcurrentQueue } from "./IConcurrentQueue";

/**
 * The thread-safe queue
 */
export class Queue<T> implements IConcurrentQueue<T> {
    queue: T[] = [];                                // The array containing all the elements of the queue
    mutex: Mutex = new Mutex();                     // The mutex lock to ensure only one thread is run at the time
    length: number = 0;                             // The length of the array
    
    /**
     * The method to enqueue a given element
     * @param element the element to push in
     */
    async enqueue(element: T) : Promise<void> {
        // Lock the current thread 
        // No other method of the queue can be called until the lock is released as they are the same lock
        const unlock = await this.mutex.lock(); 
        try {
            // Increase the length and push the element
            this.length++;
            this.queue.push(element);
        }
        finally {
            // The mutex must be unlock no matter if the body was successfully processed or not
            unlock();
        }
    }

    /**
     * Return if the queue containing any element
     * @returns true if the queue is empty
     */
    async isEmpty() : Promise<boolean> {
        // Lock the current thread 
        // No other method of the queue can be called until the lock is released as they are the same lock
        const unlock = await this.mutex.lock(); 

        try {
            // Return true if the queue's length is 0
            return (this.queue.length == 0);
        }
        finally {
            // The mutex must be unlock no matter if the body was successfully processed or not
            unlock();
        }
    }

    /**
     * Return the top of the queue and remove it from the queue
     * @returns the top of the queue
     */
    async dequeue(): Promise<T | null> {
        // Lock the current thread 
        // No other method of the queue can be called until the lock is released as they are the same lock
        const unlock = await this.mutex.lock(); 

        try {
            // Shift the array to get the first element
            let tmp = this.queue.shift();

            // If not undefined (the queue is empty) then decrease the length and return the element
            if (tmp) {
                this.length--;
                return tmp;
            }
            else return null;
        }
        finally {
            // The mutex must be unlock no matter if the body was successfully processed or not
            unlock();
        }
    }
} 