import { createContext } from "react";
import L from "leaflet"

export interface MapContextValue {
    map: L.Map | undefined,
    center: number[],
    displayRoute: (value: boolean) => void
}

export const MapContext = createContext<MapContextValue | undefined>(undefined);