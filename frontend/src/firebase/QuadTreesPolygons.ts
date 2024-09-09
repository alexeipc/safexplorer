import { FirebaseInteraction } from "./FirebaseInteraction";
import { pluginRegistry } from "../plugins/pluginRegistry";
import { ICrimeDataPluginService } from "../plugins/ICrimeDataPlugin";

/**
 * A Firebase-interaction service that fetch and the data from/to database 
 */
export class QuadTreesPolygons extends FirebaseInteraction {
    constructor() {
        super('quadtrees-polygons');
    }

    /**
     * Check if the data fetched from the data is up to date
     * @param data the given data
     * @returns true if up to date
     */
    checkCurrency(data: any): boolean {
        const addedDate = new Date(data.addedDate).getTime();
        const curDate = new Date().getTime();

        const diffInHours = (curDate - addedDate) / (1000 * 60 * 60);

        return (diffInHours <= 24);
    }

    /**
     * Request the get the data of node in the quad tree
     * @param id the id of the Quad-tree node
     * @param polygonCoordinate the coordinate of the polygon that quad-tree node represents
     * @returns the data of the quad-tree node
     */
    async request(id: string, polygonCoordinate: number[][]) {
        // Get the data from the database with the given id
        let dbRes = await this.getOne(id);

        // check if already exist and up-to-date
        if (dbRes && this.checkCurrency(dbRes)) {
            console.log('Use data from the database');
            // Use that data
            return dbRes.data;
        }

        // Else
        // Convert into the polygon type that is accepted by the crime data API
        /*let polygon = new Polygon(polygonCoordinate, false);
        // Get the crime data using the the crime API
        let obj: any = await (new CrimeAPICall()).getCrimeDataUsingPolygon(polygon, 30);

        // Flatten the data from a dictionary into a array
        let arr = Object.values(obj);*/

        const arr = await (pluginRegistry as unknown as ICrimeDataPluginService).getCrimes({
            coordinates: polygonCoordinate
        }, []);

        //console.log(arr);
        
        // update to database if the already existed 
        if (dbRes) {
            console.log('Update outdated data');
            
            // Call the update method to update the firebase storage
            this.update(id, {
                data: arr,
                addedDate: new Date().toISOString(),
            })
        }
        else {
            console.log('Create new data point');
            // Else save a new one
            this.save(id, {
                data: arr,
                addedDate: new Date().toISOString(),
            })
        }

        return arr;
    }
}