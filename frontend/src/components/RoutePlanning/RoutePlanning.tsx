import L, { LatLng } from "leaflet";
import { CSSProperties, Component } from "react"
import { RoutePlanningSearchBar } from "./RoutePlanningSearchBar";
import { Button } from "../Button";
import { MapContext } from "../Contexts/Map";
import { RoutingControl } from "../../models/Routing";
import { Marker } from "../Marker";

interface RoutePlanningProperties {
}

interface RoutePlannningStates {
    waypoints: (L.LatLng | null)[];
}

export class RoutePlanning extends Component<RoutePlanningProperties, RoutePlannningStates> {
    static contextType = MapContext;
    context!: React.ContextType<typeof MapContext>;
    routingControl: RoutingControl | null = null;
    waypointMarkers: (Marker | null)[] = [];

    constructor(props:RoutePlanningProperties) {
        super(props);

        this.state = {
            waypoints: [null, null]
        };

        this.chooseDestination = this.chooseDestination.bind(this);
        this.clickHandler = this.clickHandler.bind(this);
        this.findRoutes = this.findRoutes.bind(this);
    }

    chooseDestination(id: number, latln: L.LatLng | null, boundingbox: any | null):void {
        let updatedWaypoints: (L.LatLng | null)[] = this.state.waypoints;
        updatedWaypoints[id] = latln;
        this.setState({waypoints: updatedWaypoints});
        
        // If waypoint already exist then remove it
        this.waypointMarkers[id]?.removeMarker();
        this.routingControl?.remove();
        
        if (latln && this.context?.map) {
            // Add marker 
            let newMarker = new Marker({
                center: [latln.lat, latln.lng],
                iconUrl: "/icons/map_icon/blue_pin.png",
            });
            newMarker.addMarker().addTo(this.context.map);
            this.waypointMarkers[id] = newMarker;

            // Move to that specific point
            // if boundingbox is given then fit the boundingbox
            if (boundingbox) {
                const [latMin, latMax, lngMin, lngMax] = boundingbox;

                const southWest = L.latLng(parseFloat(latMin), parseFloat(lngMin));
                const northEast = L.latLng(parseFloat(latMax), parseFloat(lngMax));

                // Create and return the LatLngBounds object
                
                this.context?.map?.flyToBounds(L.latLngBounds(southWest, northEast));
            }
            // Else just 14
            else this.context?.map?.flyTo(latln, 14);
        }

        console.log(this.state);
    }

    clickHandler() {
        let updatedWaypoints: (L.LatLng | null)[] = [...this.state.waypoints];
        updatedWaypoints.push(null);
        this.waypointMarkers.push(null);
        this.setState({waypoints: updatedWaypoints});
    }

    findRoutes() {
        const validWaypoints = this.state.waypoints.filter((waypoint): waypoint is L.LatLng => waypoint !== null);

        if (validWaypoints.length !== this.state.waypoints.length) {
            alert("All destinations must be defined");
            return;
        }
        
        // Remove temporary markers:
        this.waypointMarkers.forEach(element => {
            element?.removeMarker();
        });

        // Add routing
        if (this.context?.map) {
            if (this.routingControl) {
                this.routingControl.remove();
            }
            
            this.routingControl = new RoutingControl({
                waypoints: validWaypoints,
                routeWhileDragging: true,
                show: true,
            });

            this.routingControl.addTo(this.context.map);
        }
    }

    containterStyle : CSSProperties =  {
        zIndex: 1000,
        width: "100%",
        maxWidth: "300px",
        margin: "10px",
        flexDirection: "column",
        boxShadow: "8px 8px 16px 8px rgba(0,0,0,0.2)",
        backgroundColor: "white",
        borderRadius: "10px",
        display: "flex",
        alignItems: "left",
        position: "absolute",
        left: 60,
    };

    render() {
        const routePlanningInternalStyle:React.CSSProperties = {
            color: "#61DBFB",
        }

        return (this.context?.displayRoute && 
            <div style={this.containterStyle}>
                <div>
                    <div style={{
                        position: "absolute",
                        top: 0,
                        right: 0
                    }}>
                        <Button onclick={() => {this.context?.displayRoute(false)}} text="" fontAwesomeIcon="fa-solid fa-circle-xmark" height={30} width={30} backgroundColor="white" color="black"></Button>
                    </div>
                    <div>
                        {this.state.waypoints.map((item: LatLng | null, key: number) => (
                            <RoutePlanningSearchBar id={key} chooseDestination={this.chooseDestination} key={key}/>
                        ))}
                    </div>
                    <Button onclick={this.clickHandler} text="" fontAwesomeIcon="fa-solid fa-plus" height={25} width={200} backgroundColor="black" color="white"></Button>
                    <Button onclick={this.findRoutes} text="Find best route" height={25} width={200} backgroundColor="black" color="white"></Button>
                </div>
                
            </div>
        )
    }
}