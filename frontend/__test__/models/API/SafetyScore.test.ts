// import { pointInPolygon } from "../../../src/API/SafetyScore";
import { SafetyScore, ZipcodeFinder } from "../../../src/API/SafetyScore";

jest.setTimeout(30000);

// describe("Test Point in Polygon function", () => {
//   it("should return true for a point inside a polygon", () => {
//     var sanfranCenterPoint = [37.7749, -122.4194];
//     var sanfranPolygon = [
//       [37.808649, -122.511986],
//       [37.78736, -122.454356],
//       [37.808044, -122.40963],
//       [37.783834, -122.388832],
//       [37.747645, -122.375169],
//       [37.708131, -122.392253],
//       [37.720848, -122.478809],
//       [37.780834, -122.513168],
//       [37.808649, -122.511986],
//     ];
//     expect(pointInPolygon(sanfranCenterPoint, sanfranPolygon)).toBe(true);
//   });

//   it("should return false for a point outside a polygon", () => {
//     var newyorkCenterPoint = [40.7128, -74.006];
//     var sanfranPolygon = [
//       [37.808649, -122.511986],
//       [37.78736, -122.454356],
//       [37.808044, -122.40963],
//       [37.783834, -122.388832],
//       [37.747645, -122.375169],
//       [37.708131, -122.392253],
//       [37.720848, -122.478809],
//       [37.780834, -122.513168],
//       [37.808649, -122.511986],
//     ];
//     expect(pointInPolygon(newyorkCenterPoint, sanfranPolygon)).toBe(false);
//   });
// });

/*describe.only("Test Safety Score class", () => {
  it("should return correct safety score for a polygon", async () => {
    var downtownOaklandPolygon = [
      [37.817431, -122.274296],
      [37.806236, -122.280363],
      [37.798552, -122.259574],
      [37.807558, -122.249578],
      [37.813733, -122.260751],
      [37.816237, -122.267861],
      [37.819135, -122.273752],
      [37.817431, -122.274296],
    ];
    var safetyScore = new SafetyScore(downtownOaklandPolygon);
    var score = await safetyScore.calculateSafetyScore();
    expect(score).toBe(82);
  });
});*/

describe("Test get Zip code of a point", () => {
  it("should return a joe", async () => {
    let zipcodeFinder = new ZipcodeFinder();

    const a: any = zipcodeFinder.findZipcode(37.801692, -122.261993);
    expect(a.properties.ZCTA5CE10).toBe("94612");
    expect(a.properties.population).toBe(14389);
  });
});

