import { Component, CSSProperties } from "react";
import { SearchPlaces } from "../api/SearchPlaces";
import { OSMSearchAddress } from "../osm/SearchAddress";
import { AmenitySearchingQuadtree } from "../models/AmenitySearchingQuadtree";
import { MapContext} from "./Contexts/Map";
import { SafetyScore } from "../api/SafetyScore";
import L from "leaflet";
import { RecentSearchPlace, RecentSearchPlaces } from "../cache/RecentSearchPlaces";
import '@fortawesome/fontawesome-free/css/all.min.css';

export interface SearchBarProperty {
    changeCenterAndZoom?(center: [number, number], zoom: number): void;
}

interface SpanProperties {
    isHidden: boolean;
    color: string;
    message: string;
}

/**
 * The state of the search bar
 */
interface SearchBarState {
    query: string;
    searchData: any | null;
    hoveredIndex: number | null;
    stillFetching: boolean;
    span: SpanProperties;
    recentSearchPlaces: RecentSearchPlace[];
    isOnFocus: boolean;
    routeIconIsOnHover: boolean;
    displayRouteIcon: boolean;
}

/**
 * The interface for search result
 */
interface SearchResult {
    lat: number;
    lng: number;
    name: string;
}

const SAFE_COLOR = "green";
const MEDIUM_SAFE_COLOR = "yellow";
const DANGEROUS_COLOR = "red";

const SAFE_SCORE = 95;
const MEDIUM_SCORE = 90;

/**
 * The search bar component with the props inteface is SearchBarProperty and state is SearchBarState
 */
export class SearchBar<T extends SearchBarProperty> extends Component<T, SearchBarState> {
    searchAPICall: SearchPlaces;
    osmSearchAddressAPI: OSMSearchAddress;
    amenitySearchingQuadTree?: AmenitySearchingQuadtree;
    searchData?: any;
    debounceTimeout: NodeJS.Timeout | null = null;
    safetyScoreService: SafetyScore;
    recentSearchPlaces: RecentSearchPlaces;

    static contextType = MapContext;
    context!: React.ContextType<typeof MapContext>;

    async componentDidMount(): Promise<void> {
        if (this.context?.map) this.amenitySearchingQuadTree = new AmenitySearchingQuadtree({map: this.context.map});
        this.setState({recentSearchPlaces: await this.recentSearchPlaces.getArray()})
    }

    constructor(props: T) {
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
            displayRouteIcon: true,
        }

        this.searchAPICall = new SearchPlaces();
        this.osmSearchAddressAPI = new OSMSearchAddress();
        this.safetyScoreService = new SafetyScore();
        this.recentSearchPlaces = new RecentSearchPlaces();

        this.handleChange = this.handleChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleDropdownClick = this.handleDropdownClick.bind(this);
        this.displaySpanContent = this.displaySpanContent.bind(this);
    }
    /**
     * Handle change in input if user stops typing for more than 1 second and load search results
     * @param e the change event
     */
    handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const query: string = e.target.value;
        this.setState({ query: query, stillFetching: true});

        // Reset previous 1 second time out
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        // Set time out for 1 second
        this.debounceTimeout = setTimeout(() => {
            if (this.context?.center) {
                Promise.all([
                    // Get addresses that match the input
                    this.osmSearchAddressAPI.getAddress(this.context.center, query),
                    // Get amenities that match the input
                    this.amenitySearchingQuadTree?.get(this.context.center, query)
                    ]).then(([addressData, amenityData] : [any, any]) => {
                        let searchData : any[] = [];
                        if (amenityData) {
                            // Flatten the amenities into the array
                            searchData = amenityData.map((element: any) => {
                                if (element.address) {
                                    return {
                                        display_name: element.name,
                                        lat: element.lat,
                                        lon: element.lon,
                                        subscript: element.address,
                                    };
                                } else {
                                    return {
                                        display_name: element.name,
                                        lat: element.lat,
                                        lon: element.lon,
                                        subscript: element.tags.amenity,
                                    };
                                }
                            });
                        }

                        console.log(addressData);

                        this.setState({searchData : searchData.concat(addressData)});
                    })
            }
        }, 1000); //  seconds debounce*/
    }

    handleSearch() {
        const { query } = this.state;

        let a: [number, number] = this.searchAPICall.getCoordinate(query);

        if (this.props.changeCenterAndZoom) 
            this.props.changeCenterAndZoom(a, 13);
    }

    handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            this.handleSearch();
        }
    }

    async displaySpanContent(item: any) {
        let safetyScore = await this.safetyScoreService.getSafetyScore(L.latLng(item.lat, item.lon));
        let spanDisplay: SpanProperties;

        if (safetyScore.overall >= SAFE_SCORE) 
            spanDisplay = {
                color: SAFE_COLOR,
                isHidden: false,
                message: `Your destination is safe. Safety score: ${safetyScore.overall}`
            }
        else if (safetyScore.overall >= MEDIUM_SCORE)
            spanDisplay = {
                color: MEDIUM_SAFE_COLOR,
                isHidden: false,
                message: `Your destination is OK. Safety score: ${safetyScore.overall}`
            }
        else 
            spanDisplay = {
                color: DANGEROUS_COLOR,
                isHidden: false,
                message: `Your destination is not recommended. Safety score: ${safetyScore.overall}`
            }

        this.setState({
            span: spanDisplay
        })
    }

    handleDropdownClick(item: any) {
        this.setState({
            query: item.display_name,
            searchData: null,
            hoveredIndex: null,
            stillFetching: false,
        });

        this.recentSearchPlaces.getArray().then((data: any) => {
            this.setState({recentSearchPlaces:  data});
        });
        
        this.recentSearchPlaces.add(item);
        this.displaySpanContent(item);

       if (this.props.changeCenterAndZoom) 
        this.props.changeCenterAndZoom([item.lat, item.lon], 14);
    }

    containerStyle: CSSProperties = {
        position: "absolute",
        zIndex: 1000,
        width: "40%",
        maxWidth: "300px",
        margin: "10px",
        flexDirection: "column",
        boxShadow: "8px 8px 16px 8px rgba(0,0,0,0.2)",
        backgroundColor: "white",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        left: 60
    };
    inputStyle: CSSProperties = {
        margin: "5px 10px 5px 10px",
        border: "none",
        background: "none",
        outline: "none",
        zIndex: 1000,
        width: "90%",
    };

    inputContainerStyle: CSSProperties = {
        display: "flex",
        alignItems: "center",
        width: "100%",
        padding: "10px",
    };

    iconStyle: CSSProperties = {
        marginRight: "10px",
        color: "#888",
    };

    dropdownStyle: CSSProperties = {
        backgroundColor: "white",
        width: "100%",
        maxHeight: "200px",
        overflowY: "auto",
        overflowX: "hidden",
        borderRadius: "0 0 10px 10px",
        zIndex: 1001,
    };

    dropdownItemStyle: CSSProperties = {
        color: "black",
        textAlign: "left",
        padding: "10px",
        borderBottom: "1px solid #ddd",
        cursor: "pointer",
    };

    render() {

        const handleMouseEnter = (index: number) => {
            this.setState({ hoveredIndex: index });
        };

        const handleInputFocus = () => {
            this.setState({ isOnFocus: true });
        }

        const handleInputBlur = () => {
            setTimeout(() => {
                this.setState({ isOnFocus: false });
            }, 200);
        }

        const handleMouseLeave = () => {
            this.setState({ hoveredIndex: null });
        };

        return (
            <div style={this.containerStyle}>
                <div style={this.inputContainerStyle}>
                    <input
                        type="text"
                        style={this.inputStyle}
                        onChange={this.handleChange}
                        value={this.state.query}
                        onKeyPress={this.handleKeyPress}
                        placeholder="Search on SafeXplorer"
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                    <i className="fas fa-search" style={this.iconStyle}></i>
                    {this.state.displayRouteIcon && 
                    <i className="fa-solid fa-signs-post" 
                        style={{
                            ...this.iconStyle,
                            color: this.state.routeIconIsOnHover ? "#9747FF" : "grey"
                        }} 
                        onClick={() =>{
                            this.context?.displayRoute(true);
                        }}
                        onMouseEnter={() => {
                            this.setState({routeIconIsOnHover: true})
                        }}
                        onMouseLeave={() => {
                            this.setState({routeIconIsOnHover: false})
                        }}
                    ></i>}
                </div>
            
                {this.state.recentSearchPlaces.length > 0 
                && this.state.isOnFocus && this.state.query.length == 0 && (
                    <div style={this.dropdownStyle}>
                        <div style={{
                            width: "100%",
                            height: "1px",
                            backgroundColor: "grey",
                            marginBottom: "5px"
                        }}></div>
                        {this.state.recentSearchPlaces.map((item: any, index: number) =>
                            item ? (
                                <div
                                    style={{
                                        ...this.dropdownItemStyle,
                                        backgroundColor: this.state.hoveredIndex === index ? "lightgrey" : "white",
                                    }}
                                    key={`recent-${index}`}
                                    onClick={() => this.handleDropdownClick(item)}
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {item.display_name}
                                    {item.subscript && <div style={{ color: "grey", fontSize: "10px" }}>{item.subscript}</div>}
                                </div>
                            ) : null
                        )}
                    </div>
                )}
                {(this.state.searchData && this.state.query.length > 0 && this.state.isOnFocus) && (
                    <div style={this.dropdownStyle}>
                        <div style={{
                            width: "100%",
                            height: "1px",
                            backgroundColor: "grey",
                            marginBottom: "5px"
                        }}></div>
                        {this.state.searchData.map((item: any, index: number) =>
                            item ? (
                                <div
                                    style={{
                                        ...this.dropdownItemStyle,
                                        backgroundColor: this.state.hoveredIndex === index ? "lightgrey" : "white",
                                    }}
                                    key={index}
                                    onClick={() => this.handleDropdownClick(item)}
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {item.display_name}
                                    {item.subscript && <div style={{ color: "grey", fontSize: "10px" }}>{item.subscript}</div>}
                                </div>
                            ) : null
                        )}
                    </div>
                )}
            </div>
            /*<div style={containerStyle}>
                <input
                    type="string"
                    style={inputStyle}
                    onChange={this.handleChange}
                    value={this.state.query}
                    onKeyPress={this.handleKeyPress}
                    placeholder="Search on SafeXplorer"
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                ></input>
                <span 
                    hidden={this.state.span.isHidden}
                    style={{
                        color: this.state.span.color,
                        fontSize: 11,
                    }}> {this.state.span.message} </span>
                {this.state.recentSearchPlaces.length > 0 
                && this.state.isOnFocus && this.state.query.length == 0 && (
                    <div style={dropdownStyle}>
                        <div style={{ color: "grey", fontSize: "10px" }}>Recent</div>
                        {this.state.recentSearchPlaces.map((item: any, index: number) =>
                            item ? (
                                <div
                                    style={{
                                        ...dropdownItemStyle,
                                        backgroundColor: this.state.hoveredIndex === index ? "lightgrey" : "white",
                                    }}
                                    key={`recent-${index}`}
                                    onClick={() => this.handleDropdownClick(item)}
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {item.display_name}
                                    {item.subscript && <div style={{ color: "grey", fontSize: "10px" }}>{item.subscript}</div>}
                                </div>
                            ) : null
                        )}
                    </div>
                )}
                {(this.state.searchData && this.state.query.length > 0 && this.state.isOnFocus) && (
                    <div style={dropdownStyle}>
                        {this.state.searchData.map((item: any, index: number) =>
                            item ? (
                                <div
                                    style={{
                                        ...dropdownItemStyle,
                                        backgroundColor: this.state.hoveredIndex === index ? "lightgrey" : "white",
                                    }}
                                    key={index}
                                    onClick={() => this.handleDropdownClick(item)}
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {item.display_name}
                                    {item.subscript && <div style={{ color: "grey", fontSize: "10px" }}>{item.subscript}</div>}
                                </div>
                            ) : null
                        )}
                    </div>
                )}
            </div>*/
        );
    }
}
