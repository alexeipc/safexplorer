import React, { Component } from "react";
import L, { DragEndEvent, LatLng, LatLngTuple, LeafletEvent, LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"
import "leaflet-routing-machine";
import "../components/CSS/RoutingInstruction.css"
import { Marker } from "./Marker";
import { SafetyScore, SafetyScoreResponse } from "../api/SafetyScore";
import { SafetyScoreBox } from "./SafetyScoreBox";
import { createRoot } from "react-dom/client";
import { SearchBar } from "./SearchBar";
import { MapLoadingQuadtree, Rectangle } from "../models/MapLoadingQuadtree";
import { RoutingControl } from "../models/Routing";
import { RoutePlanning } from "./RoutePlanning/RoutePlanning";
import { MapContext } from "./Contexts/Map";
import { Button } from "./Button";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { NavBar } from "./NavBar";

interface MapOptions {
  center: [number, number];
  zoom: number;
}

interface MapState {
  center: number[];
  map?: L.Map;
  displayRoute: boolean;
  displayNavBar: boolean;
}

// Override _clearLines function from leaflet-routing-machine

export class Map extends Component<MapOptions,MapState> {
  private map?: L.Map;
  private mapContainer: React.RefObject<HTMLDivElement>;
  private safetyScoreAPI: SafetyScore;
  private curMarker: Marker;
  private quadTree?: MapLoadingQuadtree;
  private markerLayer?: L.LayerGroup;

  constructor(props: MapOptions) {
    super(props);
    this.mapContainer = React.createRef();
    this.safetyScoreAPI = new SafetyScore();

    this.changeCenterAndZoom = this.changeCenterAndZoom.bind(this);
    this.curMarker = new Marker({
      center: [32.8380396186891, -117.10046481803438,],
      iconUrl: "/icons/map_icon/pin.png",
      popUpMsg: "Center of san francisco"
    });
  }

  componentDidMount() {
    if (this.mapContainer.current) {
      this.map = L.map(this.mapContainer.current).setView(
        this.props.center,
        this.props.zoom
      );
      
      this.setState({center: this.props.center, map: this.map});

      this.markerLayer = L.layerGroup();
      this.quadTree = new MapLoadingQuadtree(this.markerLayer);
      console.log(this.map);
      this.map.on('zoomend', () => {
        if (this.map && this.markerLayer) {
          const currentZoom = this.map.getZoom();
          if (currentZoom <= 12) {
            this.markerLayer.remove();
          } else {
            this.markerLayer.addTo(this.map);
          }
        }
      });
      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      this.map.zoomControl.setPosition('bottomright');


      var onMapClick = (e: LeafletMouseEvent) => {
        console.log(e.latlng);
        this.safetyScoreAPI.getSafetyScore(e.latlng).then(
          (safetyScoreAPIResponse: SafetyScoreResponse) => {
            if (this.map) {
              const container = document.createElement("div");
              createRoot(container).render(<SafetyScoreBox safetyScore={safetyScoreAPIResponse} />);

              L.popup()
                .setLatLng(e.latlng)
                .setContent(container)
                .openOn(this.map);
            }
          }
        )
      }

      var loadCrimeMap = () => {
        if (this.map && this.quadTree) {
          let a: LatLng = this.map.getBounds().getNorthEast();
          let b: LatLng = this.map.getBounds().getSouthWest();

          var drawRectangle = (rec: Rectangle) => {
            let southWest: L.LatLngTuple = [rec.topLeft[0], rec.topLeft[1]];
            let northEast: L.LatLngTuple = [rec.bottomRight[0], rec.bottomRight[1]];

            if (this.map)
              L.rectangle([southWest, northEast], { color: "cyan", weight: 1 }).addTo(this.map);
          }

          this.quadTree.loadMapInit(new Rectangle([b.lat, b.lng], [a.lat, a.lng])).then(
            (rec: Rectangle[]) => {
              rec.forEach((item) => {
                //drawRectangle(item);
              })
            }
          )
        }
      }

      loadCrimeMap();

      this.map.on('click', onMapClick);
      this.map.on('dragend', () => {
        if (this.map) {
          this.setState({center: [this.map.getCenter().lat, this.map.getCenter().lng]});
        }
        loadCrimeMap();
      });
      this.map.on('zoomend', loadCrimeMap);
      this.map.on('resize', loadCrimeMap);

      //this.mapContainer.current.classList.add('leaflet-rotated');
    }
  }

  componentWillUnmount() {
    if (this.map) {
      this.map.remove();
    }
  }

  displayNavBar(value: boolean) {
    this.setState({displayNavBar: value});
  }

  changeCenterAndZoom(center: [number, number], zoom: number) {

    // Render the pop up safety score for the given place place
    this.safetyScoreAPI.getSafetyScore(L.latLng(center[0], center[1])).then(
      (safetyScoreAPIResponse: SafetyScoreResponse) => {
        const container = document.createElement("div");
        createRoot(container).render(<SafetyScoreBox safetyScore={safetyScoreAPIResponse} />);

        let marker: Marker = new Marker({
          center: center,
          iconUrl: "/icons/map_icon/pin.png",
          popUpDiv: container
        });

        if (this.map) {
          marker.addMarker().addTo(this.map);
          this.curMarker.removeMarker();
          this.curMarker = marker;
        }
        this.map?.flyTo(center, zoom);
      });

  }

  render() {
    return (
      <div style={{display: "flex"}}>
        {this.state?.displayNavBar && <NavBar closeNavBar={() => this.displayNavBar(false)}></NavBar>}
        <MapContext.Provider value={
          {
            map: this.state?.map,
            center: this.state?.center,
            displayRoute: (value: boolean) => {
              this.setState({
                displayRoute: value
              });
            }
          }
        }>
          <div style={{width: "100%", zIndex: 0}}>
            <div style={{
              position: "absolute",
              zIndex: 1000,
              margin: 5,
              boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
              borderRadius: 100,
            }}>
              <Button onclick={() => this.displayNavBar(true)} text='' fontAwesomeIcon="fa-solid fa-list" height={47.5} width={47.5} color="black" backgroundColor="white" borderRadius={100}></Button>
            </div>
            {this.state != null && ! this.state.displayRoute && <SearchBar changeCenterAndZoom={this.changeCenterAndZoom}></SearchBar>}
            {this.state != null && this.state.displayRoute && <RoutePlanning></RoutePlanning>}

            <div ref={this.mapContainer} style={{ height: "100vh", width: "100%", position: "static" }} />
          </div>
        </MapContext.Provider>
      </div>
    );
  }
}
