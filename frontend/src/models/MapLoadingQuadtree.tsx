import L from 'leaflet';
import { CrimeMapLoad } from '../api/CrimeMapLoad';
import { Marker } from '../components/Marker';
import { CrimeMapCache } from '../cache/CrimeMapData';

const LARGEST_HEIGHT = 12;

export class Rectangle {
    topLeft: number[];
    bottomRight: number[];

    constructor(topLeft:number[], bottomRight:number[]) {
        this.topLeft = topLeft;
        this.bottomRight = bottomRight;
    }

    size(): number {
        return (this.bottomRight[0] - this.topLeft[0]) * (this.bottomRight[1] - this.topLeft[1]);
    }

    contains(point: number[]):boolean {
        return (
            this.topLeft[0] <= point[0] &&
            this.topLeft[1] <= point[1] &&
            point[0] <= this.bottomRight[0] &&
            point[1] <= this.bottomRight[1]
        );
    }

    isInside(rec: Rectangle):boolean {
        return (
            rec.topLeft[0] <= this.topLeft[0] && 
            rec.topLeft[1] <= this.topLeft[1] && 
            this.bottomRight[0] <= rec.bottomRight[0] && 
            this.bottomRight[1] <= rec.bottomRight[1]
        );
    }

    isCompletelyOutside(rec: Rectangle): boolean {
        return (
            this.bottomRight[0] < rec.topLeft[0] ||  // this is completely to the left of rec
            this.topLeft[0] > rec.bottomRight[0] ||  // this is completely to the right of rec
            this.bottomRight[1] < rec.topLeft[1] ||  // this is completely above rec
            this.topLeft[1] > rec.bottomRight[1]     // this is completely below rec
        );
    }
}

class Node {
    rectangle: Rectangle;
    height:number;
    data:any;

    topLeftNode?: Node;
    topRightNode?: Node;
    bottomLeftNode?: Node;
    bottomRightNode?: Node;

    constructor(rectangle: Rectangle, height: number) {
        this.rectangle = rectangle;
        this.height = height;
        this.data = null;
    }
}

export class MapLoadingQuadtree {
    root:Node;
    map: L.LayerGroup;
    crimeAPI: CrimeMapLoad;
    crimeMapCache: CrimeMapCache;
    

    constructor(map: L.LayerGroup) {
        this.root = new Node(new Rectangle([-90, -180], [90, 180]), 0);
        this.map = map;
        this.crimeAPI = new CrimeMapLoad();
        this.crimeMapCache = new CrimeMapCache();
    }
    
    async loadCrimeMarker(node: Node, id:string) {
        //this.loadAmenities(node,["restaurant"]);
        const reqBody = {
            topLeft: node.rectangle.topLeft,
            bottomRight: node.rectangle.bottomRight
        }
        
        let data = await this.crimeMapCache.request(reqBody, id);

        data.forEach((item:any) => {
            let iconUrl = "icons/map_icon/pin.png";
            if (item.type <= 14) iconUrl = "icons/crime_icon/"+item.type+".png";

            let marker = new Marker({
                center: item.coordinate,
                iconUrl: iconUrl,
                popUpMsg: item.description + " at " + item.address + " type: " + item.type,
            });
            this.map.addLayer(marker.addMarker()); 
        })
    }

    async loadMap(rec: Rectangle, node:Node, id:string):Promise<Rectangle[]> {
        if (node.data) return [];
        else if (node.rectangle.isCompletelyOutside(rec)) {
            return [];
        }
        else if (node.height == LARGEST_HEIGHT) {
            this.loadCrimeMarker(node, id);

            node.data = [node.rectangle];
            return node.data;
        }
        else if (node.rectangle.isInside(rec)) {
            this.loadCrimeMarker(node, id);

            node.data = [node.rectangle];
            return node.data;
        }
        else {
            let midX: number = (node.rectangle.topLeft[0] + node.rectangle.bottomRight[0]) / 2;
            let midY: number = (node.rectangle.topLeft[1] + node.rectangle.bottomRight[1]) / 2;
            
            let topLeftRec: Rectangle = new Rectangle(node.rectangle.topLeft, [midX, midY]);
            let topRightRec: Rectangle = new Rectangle([midX, node.rectangle.topLeft[1]], 
                                                        [node.rectangle.bottomRight[0], midY]);
            let bottomLeftRec: Rectangle = new Rectangle([node.rectangle.topLeft[0], midY], 
                                                        [midX, node.rectangle.bottomRight[1]]);
            let bottomRightRec: Rectangle = new Rectangle([midX, midY], node.rectangle.bottomRight);   

            let tmp: any[] = [];
            let promises: Promise<any[]>[] = [];

            if (!topLeftRec.isCompletelyOutside(rec)) {
                if (!node.topLeftNode) node.topLeftNode = new Node(topLeftRec, node.height + 1);
                promises.push(this.loadMap(rec, node.topLeftNode, id + "0"));
            }

            if (!topRightRec.isCompletelyOutside(rec)) {
                if (!node.topRightNode) node.topRightNode = new Node(topRightRec, node.height + 1);
                promises.push(this.loadMap(rec, node.topRightNode, id + "1"));
            }

            if (!bottomLeftRec.isCompletelyOutside(rec)) {
                if (!node.bottomLeftNode) node.bottomLeftNode = new Node(bottomLeftRec, node.height + 1);
                promises.push(this.loadMap(rec, node.bottomLeftNode, id + "2"));
            }

            if (!bottomRightRec.isCompletelyOutside(rec)) {
                if (!node.bottomRightNode) node.bottomRightNode = new Node(bottomRightRec, node.height + 1);
                promises.push(this.loadMap(rec, node.bottomRightNode, id + "3"));
            }

            let results = await Promise.all(promises);

            results.forEach((result) => {
                result.forEach((item: Rectangle) => tmp.push(item));
            });

            return tmp;
        }
    }

    async loadMapInit(rec: Rectangle):Promise<Rectangle[]> {
        if (rec.size() >= 0.01) return [];
        else return await this.loadMap(rec, this.root, "1");
    }
}