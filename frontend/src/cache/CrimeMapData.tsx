import { CacheStoring } from "./CacheStoring";
import { CrimeMapLoad } from "../api/CrimeMapLoad";
import { Mutex } from "../threadControl/Mutex";

interface CrimeDataEntry {
    id: string;
    data: any;
    addedDate: string;  
}

const MAX_CACHE_LENGTH = 10000;

class MinHeap {
    heap: CrimeDataEntry[];

    constructor(lastHeap: CrimeDataEntry[]) {
        this.heap = lastHeap;
        this.buildHeap();
    }

    insert(entry: CrimeDataEntry) {
        this.heap.push(entry);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin(): CrimeDataEntry | undefined {
        if (this.heap.length === 0) return undefined;
        if (this.heap.length === 1) return this.heap.pop();

        const min = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.bubbleDown(0);
        return min;
    }

    find(id: string): CrimeDataEntry | null {
        for (let i = 0; i < this.heap.length; i++) {
            if (this.heap[i].id === id) {
                return this.heap[i];
            }
        }
        return null;
    }

    findAndRemove(id: string): CrimeDataEntry | null {
        for (let i = 0; i < this.heap.length; i++) {
            if (this.heap[i].id === id) {
                const removedEntry = this.heap[i];
                this.heap[i] = this.heap.pop()!;
                
                this.bubbleDown(i);
                return removedEntry;
            }
        }
        return null;
    }

    bubbleUp(index: number) {
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (new Date(this.heap[index].addedDate).getTime() >= new Date(this.heap[parentIndex].addedDate).getTime()) {
                break;
            }
            [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
            index = parentIndex;
        }
    }

    bubbleDown(index: number) {
        let length = this.heap.length;
        while (true) {
            let left = 2 * index + 1;
            let right = 2 * index + 2;
            let smallest = index;

            if (left < length && new Date(this.heap[left].addedDate).getTime() < new Date(this.heap[smallest].addedDate).getTime()) {
                smallest = left;
            }
            if (right < length && new Date(this.heap[right].addedDate).getTime() < new Date(this.heap[smallest].addedDate).getTime()) {
                smallest = right;
            }
            if (smallest === index) break;

            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }

    buildHeap() {
        for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
            this.bubbleDown(i);
        }
    }

    size() {
        return this.heap.length;
    }
}

export class CrimeMapCache extends CacheStoring {
    crimeMapAPI: CrimeMapLoad;
    private mutex = new Mutex();

    constructor() {
        super('crime');
        this.crimeMapAPI = new CrimeMapLoad();
    }

    checkCurrency(data: any): boolean {
        const addedDate = new Date(data.addedDate).getTime();
        const curDate = new Date().getTime();

        const diffInHours = (curDate - addedDate) / (1000 * 60 * 60);

        return (diffInHours <= 24);
    }

    async request(rec: any, id: string): Promise<any> {
        const unlock = await this.mutex.lock(); // Lock

        try {
            let stringData: string | null = await this.getData();
            let data: CrimeDataEntry[] = [];
            let heap: MinHeap;

            if (stringData) {
                data = JSON.parse(stringData);

                //data = data.filter(entry => this.checkCurrency(entry));
                heap = new MinHeap(data);
                //data.forEach(entry => this.heap.insert(entry));

                const existingEntry = heap.find(id);

                if (existingEntry) {
                    if (this.checkCurrency(existingEntry)) {
                        console.log("USED DATA FROM CACHE", id);
                        return existingEntry.data;
                    }
                    else {
                        heap.findAndRemove(id);
                    }
                }
            }
            else {
                heap = new MinHeap([]);
            }

            const newData = await this.crimeMapAPI.getCrimeData(rec);

            const newEntry = {
                id: id,
                data: newData ? newData : "CHECKED BUT EMPTY",
                addedDate: new Date().toISOString(), // Store the date as a string
            };


            if (heap.size() >= MAX_CACHE_LENGTH) {
                heap.extractMin(); // Remove the oldest entry
            }

            heap.insert(newEntry);

            await this.saveData(heap.heap);
            console.log("ADDED", id, 'current data length:', heap.size());

            return newEntry.data;
        } finally {
            unlock();
        }
    }
}