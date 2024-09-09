export class CacheStoring {
    key:string;

    constructor(key: string) {
        this.key = key;
    }

    async saveData(data:any) {
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    async getData():Promise<any> {
        return localStorage.getItem(this.key);
    }
}