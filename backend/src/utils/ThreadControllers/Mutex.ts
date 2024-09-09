export class Mutex {
    // The mutex
    private mutex: Promise<void> = Promise.resolve();
    private isLocked: boolean = false;

    /**
     * A method that lock this mutex until it is released
     * @returns a promise to be waited
     */
    lock(): Promise<() => void> {
        // If the unlock function is called then run the next one that is being awaited
        let begin: (unlock: () => void) => void = unlock => {};
        this.mutex = this.mutex.then(() => new Promise(begin));
        
        // Set the locked is true when the lock is locked

        this.isLocked = true;

        // Return a promise that can only be finished when the unlock function is called
        return new Promise(res => {
            begin = res;

            this.isLocked = false;
        });
    }

    async untilLockIsReleased(): Promise<void> {
        await this.mutex;
    }

    /**
     * Return if the lock is currently locked
     * @returns true if the lock is locked
     */
    locked(): boolean {
        return this.isLocked;
    }
}