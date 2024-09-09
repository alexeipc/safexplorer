import { latLongToWebMercator, webMercatorToLatLong } from "../../utils/map";
import { ExternalAPICall } from "../../API/ExternalAPICall";
import { crimeConfig } from "../../configs/crime.config";
import { ICrime, IPolygon } from "../ICrimeDataPlugin";

/**
 * Because the API using Web Mercator so I have some helper function 
 * for converting between lat long and web mercator
 */

/**
 * Extract the id from the string
 * @param input the string with the id inside
 * @returns the extracted id
 */
export function extractId(input: string): string | null {
	const pattern = /Map\.ReportMapIt\('([^']+)'\)/;
	const match = input.match(pattern);

	if (match && match[1]) {
		return match[1];
	} else {
		return null;
	}
}

/**
 * Reformat the date to match if the format accepted by the API
 * @param date the given date
 * @returns the format date's string
 */
function dateFormating(date: Date) : string {
	let res: string = `${date.getFullYear()}`;
	if (date.getMonth() < 10) res += "0";
	res += `${date.getMonth() + 1}`;
	if (date.getDate() < 10) res += "0";
	res += `${date.getDate()}`;
	return res;
}

/**
 * Convert the coordinates into web mercator
 * @param coordinates the given coordinates of a polygon
 * @returns the coordinates in web mercator of a polygon
 */
function convertToWebMercator(coordinates: number[][]): number[][] {
	let res: number[][] = [];

	for (let i = 0; i < coordinates.length; ++i)
		res.push(latLongToWebMercator(coordinates[i]));

	return res;
}

/**
 * Convert the coordinates of a polygon into a URL encoded string accepted by the API
 * @param coordinates the given coordinates 
 * @returns the coorindates after being URL encoded
 */
function convertToEncodedString(coordinates: number[][]): string {
	let res:string = "%5B";
	for (let i = 0; i < coordinates.length; ++i) {
		res += '%5B' + coordinates[i][0] + '%2C' + coordinates[i][1] + '%5D';
		if (i != coordinates.length - 1) res += ',';
	}
	res += '%5D';

	return res;
}

/**
 * The interface of crime's coordinate
 */
interface CrimeCoordinate {
	x: number;					// The x-coordinate of the crime
	y: number;					// The y-coordinate of the crime
	l: number;					// The type of the crime
	i: string[];				// I don't know what it is but we're not gonna use it anw
}

/**
 * A class that is responsible for calling the API to get get the crimes' coorndinates
 */
class CrimeCoordinatesAPICall extends ExternalAPICall {
	constructor() {
		super("https://crimemapping.com");
	}

	async postRequest(endpoint: string, body: string, options = {}) {
		const defaultOptions = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-Requested-With': 'XMLHttpRequest',
				// Add other headers as necessary
			},
			body: body,
		};

		const finalOptions = Object.assign(defaultOptions, options);

		const response = await fetch(endpoint, finalOptions);
		return response.json(); // or .text(), .blob(), depending on the expected response
	}


	/**
	 * Get the coordinates, id and type of crimes inside a given polygon
	 * @param polygon the given polygon
	 */
	async getCrimeDataUsingPolygon(polygon: IPolygon) : Promise<any> {
		const numberOfdays = crimeConfig.NUM_DAY;

		const curDate = new Date();

		const prior = new Date(
			new Date().setDate(curDate.getDate() - numberOfdays)
		);

		const endpoint: string = "https://www.crimemapping.com/map/MapUpdated";

		const data = {
		filterdata: JSON.stringify({
			SelectedCategories: [
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"10",
			"11",
			"12",
			"13",
			"14",
			"15",
			],
			SpatialFilter: {
			FilterType: 2,
			Filter: JSON.stringify({
				rings: [convertToWebMercator(polygon.coordinates)],
				spatialReference: {
				wkid: 102100,
				},
			}),
			},
			TemporalFilter: {
			PreviousID: 3,
			PreviousNumDays: 7,
			PreviousName: "Previous Week",
			FilterType: "Previous",
			ExplicitStartDate: dateFormating(prior),
			ExplicitEndDate: dateFormating(curDate),
			},
			AgencyFilter: [],
		}),
		shareMapID: "",
		shareMapExtent: "",
		alertID: "",
		spatfilter: JSON.stringify({
			rings: [convertToWebMercator(polygon.coordinates)],
			spatialReference: {
			wkid: 102100,
			latestWkid: 3857,
			},
		})
		};

		interface RequestData {
			filterdata: string; // The filter data is stringified.
			shareMapID: string;
			shareMapExtent: string;
			alertID: string;
			spatfilter: string; // This is also stringified.
		}
		const formData = new URLSearchParams();

		for (let key in data) {
			formData.append(key, data[key as keyof RequestData]);
		}

		let response = await this.postRequest(endpoint, formData.toString());

		return response;
	}
}

/**
 * The interface of crime's coordinates
 */
interface CrimeInfor {
	ID?: any;
	Type: string;
	Description: string;
	IncidentNum: string;
	Location: string;
	Agency: string;
	Date: number;
	MapIt: string;
	CrimeSingleValue?: any;
	ResourcePath: string;
	VersionPath: string;
}

/**
 * A class that is responsible for call the API to get the crime's information
 */
class CrimeInforAPICall extends ExternalAPICall {
	constructor() {
		super("https://crimemapping.com");
	}

	async getCrimeDataUsingPolygon(polygon: IPolygon) : Promise<any> {
		const numberOfdays = crimeConfig.NUM_DAY;
		const curDate = new Date();
		const prior = new Date(
			new Date().setDate(curDate.getDate() - numberOfdays)
		);

		const reqString: string = 
			'https://www.crimemapping.com/Map/CrimeIncidents_Read?paramFilt=%7B"SelectedCategories"%3A%5B"1"%2C"2"%2C"3"%2C"4"%2C"5"%2C"6"%2C"7"%2C"8"%2C"9"%2C"10"%2C"11"%2C"12"%2C"13"%2C"14"%2C"15"%5D%2C"SpatialFilter"%3A%7B"FilterType"%3A2%2C"Filter"%3A"%7B%5C"rings%5C"%3A%5B' +
			convertToEncodedString(convertToWebMercator(polygon.coordinates)) +
			'%5D%2C%5C"spatialReference%5C"%3A%7B%5C"wkid%5C"%3A102100}}"}%2C"TemporalFilter"%3A%7B"PreviousID"%3A3%2C"PreviousNumDays"%3A7%2C"PreviousName"%3A"Previous%20Week"%2C"FilterType"%3A"Previous"%2C"' +
			'ExplicitStartDate"%3A"' +
			dateFormating(prior) +
			'"%2C"' +
			'ExplicitEndDate"%3A"' +
			dateFormating(curDate) +
			'"}%2C"' +
			'AgencyFilter"%3A%5B%5D}&unmappableOrgIDs=System.Collections.Generic.List%601%5BSystem.Int32%5D';

		let response = await this.postRequest(reqString, null);

		return response;
	};
}

export class CrimeDataAPI {
	crimeInforAPI: CrimeInforAPICall;
	crimeCoordinatesAPI: CrimeCoordinatesAPICall;

	constructor() {
		this.crimeInforAPI = new CrimeInforAPICall();
		this.crimeCoordinatesAPI= new CrimeCoordinatesAPICall();
	}

	/**
	 * Because the data has some bugs with the type so we have to fix it by standardlized it
	 * @param l the given unstandardlized type
	 */
	getType(l : number) : number {
		// if the type is correctly formated then do nothing
		if (l <= 18) return l;
		// some times where is a 0 in the middle like 102 is supposed to be 12
		else if (l > 100) {
			let first = Math.floor(l / 10);
			let last = l % 10;
			return first + last;
		}
		// else we don't know that the bug is
		else return -1;
	}

	/**
	 * 
	 * @param polygon the given polygon
	 * @returns the dictionary of the polygon
	 */
	async getCrimeDataUsingPolygon(polygon: IPolygon) : Promise<{[id: string]: ICrime}> {
		let [coordinatesWrapper, infoWrapper] = await Promise.all([
			this.crimeCoordinatesAPI.getCrimeDataUsingPolygon(polygon),
			this.crimeInforAPI.getCrimeDataUsingPolygon(polygon),
		]);

		let coordinates = coordinatesWrapper["result"]["rs"];
    	let info = infoWrapper["Data"];

		let criminalDictionary: { [id: string]: ICrime } = {};

		// Spread the coordinates out into the criminal dictionary
		coordinates.forEach((element: CrimeCoordinate) => {
			element.i.forEach((id: string) => {
				criminalDictionary[id] = {
				coordinate: webMercatorToLatLong([element.x, element.y]),
				type: this.getType(element.l),
				};
			});
		});

		// Put the info in the matching coordinates
		info?.forEach((element: CrimeInfor) => {
			let id: string | null = extractId(element.MapIt);
			if (id && criminalDictionary[id]) {
				// Spread the element object into the criminal object
				criminalDictionary[id] = {
				...criminalDictionary[id], // Spread existing properties
				address: element.Location,
				agency: element.Agency,
				date: element.Date.toString(),
				description: element.Description,
				};
			}
		});

		return criminalDictionary;
	}
}