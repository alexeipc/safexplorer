import { QuadTreesPolygons } from "../firebase/QuadTreesPolygons";
import { IConcurrentQueue } from "../utils/DataStructures/IConcurrentQueue";
import { Queue } from "../utils/DataStructures/Queue";

const LARGEST_HEIGHT = 12;
const MAX_QUEUE_SIZE = 1000;

/**
 * A rectangle the represent an area in the Quad-tree
 */
export class Rectangle {
    topLeft: number[];
    bottomRight: number[];

    constructor(topLeft:number[], bottomRight:number[]) {
        this.topLeft = topLeft;
        this.bottomRight = bottomRight;
    }

    /**
     * Return the area of this rectangle according the the formula: width * height
     * @returns the area of this rectangle
     */
    size(): number {
        return (this.bottomRight[0] - this.topLeft[0]) * (this.bottomRight[1] - this.topLeft[1]);
    }

    /**
     * Check if the rectangle contains the given point
     * @param point the given point
     * @returns if the rectangle contains the given point
     */
    contains(point: number[]):boolean {
        return (
            this.topLeft[0] <= point[0] &&
            this.topLeft[1] <= point[1] &&
            point[0] <= this.bottomRight[0] &&
            point[1] <= this.bottomRight[1]
        );
    }

    /**
     * Check if this rectangle is inside a given rectangle
     * @param rec the given rectangle to check
     * @returns true if is inside the rectangle
     */
    isInside(rec: Rectangle):boolean {
        return (
            rec.topLeft[0] <= this.topLeft[0] && 
            rec.topLeft[1] <= this.topLeft[1] && 
            this.bottomRight[0] <= rec.bottomRight[0] && 
            this.bottomRight[1] <= rec.bottomRight[1]
        );
    }

    /**
     * Check if the given rectangle is complete outside this rectangle (no intersection)
     * @param rec the given rectangle
     * @returns true if this rectangle is complete outside the given rectangle 
     */
    isCompletelyOutside(rec: Rectangle): boolean {
        return (
            this.bottomRight[0] < rec.topLeft[0] ||  // this is completely to the left of rec
            this.topLeft[0] > rec.bottomRight[0] ||  // this is completely to the right of rec
            this.bottomRight[1] < rec.topLeft[1] ||  // this is completely above rec
            this.topLeft[1] > rec.bottomRight[1]     // this is completely below rec
        );
    }
}

/**
 * The node the represent a rectangle in the Quad-tree
 */
class Node {
    rectangle: Rectangle;       // The rectangle that the node represent
    height:number;              // The height of the current node to the root
    data:any;                   // The data that the node holding
    lastUpdatedDate?:string;    // The last updated date of the data

    topLeftNode?: Node;         // The top left quarter rectangle of the current rectangle
    topRightNode?: Node;        // The top right quarter rectangle of the current rectangle
    bottomLeftNode?: Node;      // The bottom left quarter rectangle of the current rectangle
    bottomRightNode?: Node;     // The bottom right quarter rectangle of the current rectangle

    constructor(rectangle: Rectangle, height: number) {
        this.rectangle = rectangle;
        this.height = height;
        this.data = null;
    }
}
/**
 * The Quad-tree that load the map partially for data and request saving
 */
export class MapLoadingQuadtree {
    root:Node;                                                              // The root of the tree
    quadTreesPolygonsDb: QuadTreesPolygons;                                 // The Db service to fetch data about an area
    static readonly concurrentQueue: IConcurrentQueue<Node> = new Queue();; // The concurrentQueue saving the node that holding the data 

    constructor() {
        // The root represent the entire world
        this.root = new Node(new Rectangle([-90, -180], [90, 180]), 0);
        this.quadTreesPolygonsDb = new QuadTreesPolygons();
    }

    /**
     * Save data the to given node and keep in RAM
     * @param node the given node
     * @param data the data want to save in the node
     */
    async saveDataToRam(node: Node, data: any) {
        // When the data allowance queue is fulled then remove the most outdated data (the top of the queue)
        if (MapLoadingQuadtree.concurrentQueue.length >= MAX_QUEUE_SIZE) {
            let outdatedNode = await MapLoadingQuadtree.concurrentQueue.dequeue();

            if (outdatedNode) {
                // Remove the outdated data from the queue
                delete outdatedNode.data;
                console.log("REMOVED NODE DATA", MapLoadingQuadtree.concurrentQueue.length);
            }
        }
        
        // Update the time and data
        node.lastUpdatedDate = new Date().toISOString();
        node.data = data;

        // Push the just added data into the conccurentQueue
        await MapLoadingQuadtree.concurrentQueue.enqueue(node);
    }
    /**
     * Load the crime data inside the rectangle that the node represents
     * @param node the given node
     * @param id the id of the node
     * @returns the crime data inside the rectangle that the node represents
     */
    async loadCrimeMarker(node: Node, id:string): Promise<any[]> {
        // Convert the rectangle into the polygon type
        let polygonCoordinate:number[][] = [
            node.rectangle.topLeft,
            [node.rectangle.bottomRight[0], node.rectangle.topLeft[1]],
            node.rectangle.bottomRight,
            [node.rectangle.topLeft[0], node.rectangle.bottomRight[1]],
            node.rectangle.topLeft
        ]

        // fetch the data from the database service
        return await this.quadTreesPolygonsDb.request(id, polygonCoordinate);
    }

    /**
     * Check if the given date is updated (within 24 hours)
     * @param addedDateStr the given data in form of string ISO
     * @returns if the date is updated
     */
    checkCurrency(addedDateStr: string | undefined): boolean {
        if (! addedDateStr) return false;
        const addedDate = new Date(addedDateStr).getTime();

        // Get the current date
        const curDate = new Date().getTime();

        // Get the differece in hours between the given date and the current date
        const diffInHours = (curDate - addedDate) / (1000 * 60 * 60);

        // Return true if the difference is within 24 hours
        return (diffInHours <= 24);
    }

    /**
     * Load the crime data inside given bounding box
     * @param rec the target bounding box that we wanted to get the crime data
     * @param node the current considerd node
     * @param id the id of the current node
     * @returns the crime data inside the given bounding box
     */
    async loadMap(rec: Rectangle, node:Node, id:string):Promise<any[]> {
        // If node already contains the data inside
        if (node.data) {
            // Check if the data is up to date
            if (this.checkCurrency(node.lastUpdatedDate)) {
                // if yes then do nothing
                console.log("Use data from RAM");
            }
            else {
                // if no the get the new data for the node
                console.log("RAM's data has been outdated");
                await this.saveDataToRam(node, await this.loadCrimeMarker(node, id));
            }
            // Return the data that the node contains
            return node.data;
        }
        // If the currently considered node doesn't have any intersection with the boudingbox we want to load then return empty data
        else if (node.rectangle.isCompletelyOutside(rec)) {
            return [];
        }
        // If the currently considerd node is too small then return data inside
        else if (node.height == LARGEST_HEIGHT) {
            await this.saveDataToRam(node, await this.loadCrimeMarker(node, id));
            return node.data;
        }
        // If the currently considered node is complete inside then return all the data inside the node
        else if (node.rectangle.isInside(rec)) {
            await this.saveDataToRam(node, await this.loadCrimeMarker(node, id));
            return node.data;
        }
        else {
            // Get the middle point if the rectangle
            let midX: number = (node.rectangle.topLeft[0] + node.rectangle.bottomRight[0]) / 2;
            let midY: number = (node.rectangle.topLeft[1] + node.rectangle.bottomRight[1]) / 2;
            
            // Form the top-left rectangle
            let topLeftRec: Rectangle = new Rectangle(node.rectangle.topLeft, [midX, midY]);
            // Form the top-right rectangle
            let topRightRec: Rectangle = new Rectangle([midX, node.rectangle.topLeft[1]], 
                                                        [node.rectangle.bottomRight[0], midY]);
            // Form the bottom-left rectangle
            let bottomLeftRec: Rectangle = new Rectangle([node.rectangle.topLeft[0], midY], 
                                                        [midX, node.rectangle.bottomRight[1]]);
            // Form the bottom-right rectangle
            let bottomRightRec: Rectangle = new Rectangle([midX, midY], node.rectangle.bottomRight);   

            let tmp: any[] = [];
            // The array that contains all the promises so that we can fetch the data from it's children node simultaneously
            let promises: Promise<any[]>[] = []; 

            // If the top-left rectangle has interction with the given bounding box then consider it
            if (!topLeftRec.isCompletelyOutside(rec)) {
                // If the the node hasn't been constructed then construct one
                if (!node.topLeftNode) node.topLeftNode = new Node(topLeftRec, node.height + 1);
                // Consider that node
                promises.push(this.loadMap(rec, node.topLeftNode, id + "0"));
            }
            // If the top-right rectangle has interction with the given bounding box then consider it
            if (!topRightRec.isCompletelyOutside(rec)) {
                // If the the node hasn't been constructed then construct one
                if (!node.topRightNode) node.topRightNode = new Node(topRightRec, node.height + 1);
                // Consider that node
                promises.push(this.loadMap(rec, node.topRightNode, id + "1"));
            }
            // If the bottom-left rectangle has interction with the given bounding box then consider it
            if (!bottomLeftRec.isCompletelyOutside(rec)) {
                // If the the node hasn't been constructed then construct one
                if (!node.bottomLeftNode) node.bottomLeftNode = new Node(bottomLeftRec, node.height + 1);
                // Consider that node
                promises.push(this.loadMap(rec, node.bottomLeftNode, id + "2"));
            }
            // If the bottom-right rectangle has interction with the given bounding box then consider it
            if (!bottomRightRec.isCompletelyOutside(rec)) {
                // If the the node hasn't been constructed then construct one
                if (!node.bottomRightNode) node.bottomRightNode = new Node(bottomRightRec, node.height + 1);
                // Consider that node
                promises.push(this.loadMap(rec, node.bottomRightNode, id + "3"));
            }

            // Wait all the promises to be completed
            let results = await Promise.all(promises);

            // Combine all the data from it's children node
            results.forEach((result) => {
                if (Array.isArray(result)) {  // Check if result is an array
                    result.forEach((item: any) => tmp.push(item));
                }
            });

            // return the result
            return tmp;
        }
    }

    /**
     * Return the all the crime data inside the rectangle bouding box
     * @param rec the bounding box
     * @returns all the crime data inside the bouding box
     */
    async loadMapInit(rec: Rectangle):Promise<any[]> {
        return await this.loadMap(rec, this.root, "1");
    }
}

// Create a global instance so it's can be shared among the requests
export const globalMapLoadingQuadTree = new MapLoadingQuadtree();