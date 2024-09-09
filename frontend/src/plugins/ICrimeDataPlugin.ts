import { IPlugin } from "./IPlugin";

export interface ICrime {
    coordinate?: number[];
    type?: number;
    description?: string;
    address?: string;
    agency?: string;
    date?: string;
}
export interface IPolygon {
    coordinates: number[][];
}

export interface ICrimeDataPlugin extends IPlugin {
    getCrimes(polygon: IPolygon, out: ICrime[]): Promise<ICrime[]>;
}

export interface ICrimeDataPluginService {
    getCrimes(polygon: IPolygon, out: ICrime[]): Promise<ICrime[]>;
}