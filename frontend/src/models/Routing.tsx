import L from 'leaflet';
import 'leaflet-routing-machine';

export class RoutingControl extends L.Routing.Control {
    constructor(options: L.Routing.RoutingControlOptions | undefined) {
        // Ensure waypoints are passed or defined
        const waypoints = options?.waypoints || [];

        // Create a custom plan with waypoints
        const customPlan = new L.Routing.Plan(waypoints, {
            createMarker: (i, wp) => {
                return L.marker(wp.latLng, {
                    icon: L.icon({
                        iconUrl: "/icons/map_icon/blue_pin.png",
                        iconSize: [20, 22],
                    })
                });
            },
        });

        super({
            ...options,
            plan: customPlan,
            lineOptions: {
                styles: [{color: 'green', weight: 0}],
                extendToWaypoints: true,
                missingRouteTolerance: 2
            }
        });
    }


    addTo(map: L.Map): this {
        super.addTo(map);
        // Listen for the 'routesfound' event
        this.on('routesfound', (e) => {
            const routes = e.routes;
            const waypoints = routes[0].coordinates; // Get the coordinates of the first route

            // Draw the segments with alternating colors
            let colors = ['red', 'blue'];

            console.log(waypoints.length);

            /*waypoints.forEach((point : any, index : number) => {
                if (index < waypoints.length - 1) {
                    let segment = [point, waypoints[index + 1]];
                    console.log(segment)
                    let color = colors[index % colors.length];

                    L.polyline(segment, { color: "blue" }).addTo(map);
                }
            });*/

            let a = L.polyline(waypoints, { color: "blue", weight: 2 })
            console.log(a);
            a.addTo(map);
        });
        return this;
    }
}
