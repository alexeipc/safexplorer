import {
  point as turfPoint,
  polygon as turfPolygon,
  booleanPointInPolygon,
  lineString as turfLineString,
  bbox as turfBbox,
  bboxPolygon as turfBboxPolygon,
  feature,
  featureCollection,
} from "@turf/turf";
import dotenv from "dotenv";
import { Crime } from "../interfaces/crime";
import fs from "fs";
import path from "path";
import RBush from "rbush";
import {
  MapLoadingQuadtree,
  Rectangle,
  globalMapLoadingQuadTree,
} from "../models/MapLoadingQuadTree";
import zipCodesGeo from "../data/usa_zip_codes_geo.json";
import zipCodesData from "../data/zip-codes-data.json";
import { safetyScoreConfig } from "../configs/safetyScore.config";
import { SafetyScoreCachingService } from "../cache/SafetyScoreCachingService";

interface zipCodeItem {
  zip: number;
  population: number;
  zip_code: number;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  county: string;
}

interface PolygonItem {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  feature: typeof featureCollection;
}

export class ZipcodeFinder {
  polygonData: any;
  zipCodePopulation: { [id: string]: number } = {};
  rtree: RBush<PolygonItem>;

  /**
   * Constructor for the ZipcodeFinder class
   */
  constructor() {
    zipCodesData.forEach((zipCodeItem: zipCodeItem) => {
      this.zipCodePopulation[zipCodeItem.zip_code] = zipCodeItem.population;
    });

    let unfilterdData = JSON.parse(JSON.stringify(zipCodesGeo));

    this.polygonData = unfilterdData.features.filter(
      (feature: any) => feature && feature.geometry
    );

    this.rtree = new RBush();

    let polygonItems = this.polygonData.map((feature: any) => {
      let bbox = turfBbox(feature);
      feature.properties.population = this.findPopulation(
        feature.properties.ZCTA5CE10
      );
      return {
        minX: bbox[0],
        minY: bbox[1],
        maxX: bbox[2],
        maxY: bbox[3],
        feature,
      };
    });

    this.rtree.load(polygonItems);
  }

  /**
   * Find the zipcode of the given coordinates
   * @param lat the latitude of the coordinates
   * @param lon the longitude of the coordinates
   * @returns the zipcode of the given coordinates
   */
  findZipcode(lat: number, lon: number): any {
    let point = turfPoint([lon, lat]);

    const bbox = turfBbox(point);
    const potentialMatches = this.rtree.search({
      minX: bbox[0],
      minY: bbox[1],
      maxX: bbox[2],
      maxY: bbox[3],
    });

    const res = potentialMatches.filter((item: any) =>
      booleanPointInPolygon(point, item.feature)
    );

    if (res.length > 0) return res[0].feature;
    else throw new Error("Sorry, we don't have data for the chosen area");
  }

  /**
   * Find the population of the given zipcode
   * @param zipcode the zipcode to find the population of
   * @returns the population of the given zipcode
   */
  findPopulation(zipcode: string): number {
    let data = this.zipCodePopulation[Number(zipcode)];
    if (data) return data;
    else return 1;
  }
}

export class SafetyScore {
  private safetyScore: number;
  //private polygon: Polygon;
  private originalPolygon: number[][];
  private crimeFrequency: number[];
  private crimeQuadTree: MapLoadingQuadtree;
  private boundingRectangle: Rectangle;
  private population: number;
  private zipCode: number;

  /**
   * Constructor for SafetyScore
   * @param polygon the polygon coordinates of the current area
   * @param population the population of the current area
   */
  constructor(polygon: number[][], zipcode: string, population: number) {
    this.safetyScore = 0;
    this.population = population;
    this.originalPolygon = polygon;
    var newPolygon = this.polygonBbox(polygon);

    this.zipCode = parseInt(zipcode);

    this.boundingRectangle = new Rectangle(newPolygon[0], newPolygon[2]);
    //console.log(this.boundingRectangle);

    this.crimeQuadTree = globalMapLoadingQuadTree;
    //this.polygon = new Polygon(newPolygon, false);
    this.crimeFrequency = new Array(14).fill(0);
  }

  /**
   * Calculate a bounding box for a given polygon
   * @param polygon the polygon coordinates
   * @returns the bounding box coordinates for the given polygon
   */
  public polygonBbox(polygon: number[][]) {
    var line = turfLineString(polygon);
    var bbox = turfBbox(line);
    var bboxPolygon = turfBboxPolygon(bbox);
    return bboxPolygon.geometry.coordinates[0];
  }

  /**
   * @returns the safety score of the current area
   */
  public getSafetyScore() {
    return this.safetyScore;
  }

  /**
   * Set the safety score of the current area
   * @param safetyScore the safety score to set
   */
  public setSafetyScore(safetyScore: number) {
    this.safetyScore = safetyScore;
  }

  /**
   * Fetch the crime data from the given rectangle bounding box
   * @returns the crime data for the given bounding box
   */
  public async getCrimeData() {
    return await this.crimeQuadTree.loadMapInit(this.boundingRectangle);
  }

  // Return true if a point is in a polygon
  /**
   * Check if a point is in a polygon
   * @param point the point to check
   * @param polygon the polygon to check
   * @returns true if the point is in the polygon, false otherwise
   */
  public pointInPolygon(point: number[], polygon: number[][]) {
    var pt = turfPoint(point);
    var poly = turfPolygon([polygon]);
    return booleanPointInPolygon(pt, poly);
  }

  /**
   * Calculate the number of days from today to the given date
   * @param dateString the date to calculate the days from today
   * @returns the number of days from today to the given date
   */
  public calculateDaysFromToday(dateString: string): number {
    // Parse the dateString into components
    const year = Number(dateString.substr(0, 4));
    const month = Number(dateString.substr(4, 2)) - 1; // Months are zero-based in Date objects
    const day = Number(dateString.substr(6, 2));
    const hour = Number(dateString.substr(8, 2));
    const minute = Number(dateString.substr(10, 2));
    const second = Number(dateString.substr(12, 2));

    // Create Date object from parsed components
    const targetDate = new Date(year, month, day, hour, minute, second);

    // Get current date
    const currentDate = new Date();

    // Calculate the difference in milliseconds
    const differenceMs = targetDate.getTime() - currentDate.getTime();

    // Convert milliseconds to days
    const differenceDays = Math.floor(differenceMs / (1000 * 60 * 60 * 24));

    return Math.abs(differenceDays);
  }

  /**
   * Sort the crime data and remove the crime data that are not in the original polygon
   * @param crimeData crime data to sort
   * @returns the crime data that are in the original polygon
   */
  public crimeSort(crimeData: Crime[]) {
    return crimeData.filter((value: any) =>
      value.coordinate
        ? this.pointInPolygon(value.coordinate, this.originalPolygon)
        : false
    );
  }

  // Calculate the safety score
  /**
   * Calculate the safety score of the current area
   * @returns the safety score of the current area
   */
  public async calculateSafetyScore() {
    // Check if data from cache exist

    var safetyScoreCachingService : SafetyScoreCachingService = new SafetyScoreCachingService();

    var dataFromCache = await safetyScoreCachingService.get(this.zipCode);

    if (dataFromCache != null) {
      console.log("Use safetyscore from cache");
      return dataFromCache.overallSafetyScore;
    }


    var safetyScore = 0;
    var crimeData = await this.getCrimeData();

    var crimeDataSorted = this.crimeSort(crimeData);

    var frequency = new Array(14).fill(0);
    var weigtedScore = safetyScoreConfig.SAFETY_SCORE_FORMULAR(crimeDataSorted);
    // Formula for safety score: 100 - (weighted score / population) * 100000
    safetyScore = Math.round(100 - (weigtedScore / this.population) * 100000);

    // Save the data to cache

    safetyScoreCachingService.set(this.zipCode, safetyScore, crimeData);

    return safetyScore;
  }

  /**
   * Initialize the safety score of the current area
   */
  public async init() {
    var score = await this.calculateSafetyScore();
    this.setSafetyScore(score);
  }
}
