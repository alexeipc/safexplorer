import L from 'leaflet'
import "leaflet/dist/leaflet.css";

interface MarkerProps {
    center: [number, number];
    iconUrl: string;
    popUpMsg?: string;
    popUpDiv?: HTMLDivElement;
}

export class Marker {
    icon: L.Icon;
    center: [number, number]
    popUpMsg?: string;
    popUpDiv?: HTMLDivElement;
    markerFunc?: L.Marker;

    constructor(props: MarkerProps) {
        this.icon = L.icon({
            iconUrl: props.iconUrl,
            iconSize: [20, 22],
        });

        this.center = props.center;
        if (props.popUpMsg) this.popUpMsg = props.popUpMsg;
        if (props.popUpDiv) this.popUpDiv = props.popUpDiv;
    }

    addMarker() {
        this.markerFunc = L.marker(this.center, {icon: this.icon});

        if (this.popUpMsg) this.markerFunc = this.markerFunc.bindPopup(this.popUpMsg).openPopup();
        else if (this.popUpDiv) this.markerFunc = this.markerFunc.bindPopup(this.popUpDiv).openPopup();

        return this.markerFunc;
    }

    removeMarker() {
        this.markerFunc?.remove();
    }
}