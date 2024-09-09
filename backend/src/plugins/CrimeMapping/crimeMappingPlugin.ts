import { ICrimeDataPlugin, IPolygon, ICrime } from "../ICrimeDataPlugin";
import { CrimeDataAPI } from "./crimeDataAPI";

export class CrimeMappingPlugin implements ICrimeDataPlugin {
    pluginName: string;
    dataSourceName: string;

    constructor() {
        this.pluginName = "Crime Mapping Plugin";
        this.dataSourceName = "Crime Mapping";
    }

    async getCrimes(polygon: IPolygon, out: ICrime[]): Promise<ICrime[]> {
        const criminalDictionary : {[id: string]: ICrime;} = await new CrimeDataAPI().getCrimeDataUsingPolygon(polygon);

        out.push(...Object.values(criminalDictionary));

        return out;
    }
}