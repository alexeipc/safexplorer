import { CrimeAPICall, CrimeCoordinatesAPICall, CrimeInfoAPICall, webMercatorToLatLong} from "../../../src/API/CrimeData";
import { Polygon } from "../../../src/interfaces/polygons";
import { extractId } from "../../../src/API/CrimeData";

jest.setTimeout(30000);

describe("Test Extract ID function", () => {
    it('should extract the ID from the first test string', () => {
        const testString1 = "<a href=\"javascript:void(0);\" onclick=\"Map.ReportMapIt('0_8fd195f5-5338-49c6-92fb-c0a737971016')\" class=\"mapIt\">Map it</a>";
        const expected = '0_8fd195f5-5338-49c6-92fb-c0a737971016';
        const result = extractId(testString1);
        expect(result).toBe(expected);
    });

    it('should extract the ID from the second test string', () => {
        const testString2 = "<a href=\"javascript:void(0);\" onclick=\"Map.ReportMapIt('0_d91dfe2c-9c88-4766-8ba2-2cb285922181')\" class=\"mapIt\">Map it</a>";
        const expected = '0_d91dfe2c-9c88-4766-8ba2-2cb285922181';
        const result = extractId(testString2);
        expect(result).toBe(expected);
    });
})

/*describe("Test Crime Data API Request", () => {
    it("should return joe joe", async () => {
        let crimeInfo = new CrimeInfoAPICall();
        let crimeCoordinates = new CrimeCoordinatesAPICall();
        let testPolygon = new Polygon([
            [-9158215.903955312,3391721.6319572125],
            [-9158215.903955312,3406301.99510259],
            [-9140539.84116439,3406301.99510259],
            [-9140539.84116439,3391721.6319572125],
            [-9158215.903955312,3391721.6319572125]], true);

        for (let i = 0; i < testPolygon.coordinates.length; ++i)
            testPolygon.coordinates[i] = webMercatorToLatLong(testPolygon.coordinates[i]);

        let joe:any = await crimeInfo.getCrimeDataUsingPolygon(testPolygon, 7);
        let coordinates:any = await crimeCoordinates.getCrimeDataUsingPolygon(testPolygon, 7);

        expect(coordinates["result"]["rs"]).toBeTruthy();
        expect(joe.Data).toBeTruthy();
    })
})

describe("Test combine data", () => {
    it("should return a dictionary", async () => {
        let crimeData = new CrimeAPICall();

        let testPolygon = new Polygon([
            [-9158215.903955312,3391721.6319572125],
            [-9158215.903955312,3406301.99510259],
            [-9140539.84116439,3406301.99510259],
            [-9140539.84116439,3391721.6319572125],
            [-9158215.903955312,3391721.6319572125]], true);
        
        let dict = await crimeData.getCrimeDataUsingPolygon(testPolygon, 7);
        //console.log(dict);
    })
})*/
