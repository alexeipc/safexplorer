import { CSSProperties, Context } from "react";
import { MapContext, MapContextValue } from "../Contexts/Map";
import { SearchBar, SearchBarProperty } from "../SearchBar";
import L from 'leaflet';

interface RoutePlanningSearchBarProperties extends SearchBarProperty {
    id: number;
    chooseDestination(id: number, latln: L.LatLng | null, boundingbox: any | null):void
}

export class RoutePlanningSearchBar extends SearchBar<RoutePlanningSearchBarProperties>{
    static contextType = MapContext;
    context!: React.ContextType<typeof MapContext>;

    constructor(props: RoutePlanningSearchBarProperties) {
        super(props);
        this.state = {
            query: "",
            searchData: null,
            hoveredIndex: null,
            stillFetching: false,
            span: {
                isHidden: true,
                color: "green",
                message: "",
            },
            recentSearchPlaces: [],
            isOnFocus: false,
            routeIconIsOnHover: false,
            displayRouteIcon: false,
        }
    }

    handleDropdownClick(item: any) {
        this.setState({
            query: item.display_name,
            searchData: null,
            hoveredIndex: null,
        }); 

        this.recentSearchPlaces.getArray().then((data: any) => {
            this.setState({recentSearchPlaces:  data});
        });
        this.recentSearchPlaces.add(item);
        super.displaySpanContent(item);
    
        this.props.chooseDestination(this.props.id, L.latLng(item.lat, item.lon), item.boundingbox);
    }

    containerStyle: CSSProperties = {
        zIndex: 1000,
        width: "calc(100% - 60px)",
        maxWidth: "300px",
        margin: "15px",
        flexDirection: "column",
        backgroundColor: "white",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        border: "solid 1px grey"
    };
    inputStyle: CSSProperties = {
        margin: "5px 10px 5px 10px",
        border: "none",
        background: "none",
        outline: "none",
        zIndex: 1000,
        width: "90%",
    };
    dropdownStyle: CSSProperties = {
        backgroundColor: "white",
        width: "calc(100% - 60px)",
        maxHeight: "200px",
        overflowY: "auto",
        overflowX: "hidden",
        borderRadius: "0 0 10px 10px",
        position: "absolute",
        transform: "translateY(40px)", 
        zIndex: 1001,
        border: "solid 1px grey"
    };
}