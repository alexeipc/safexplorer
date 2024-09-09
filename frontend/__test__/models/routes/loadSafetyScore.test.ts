import { Request, Response } from "express";
import { LoadSafetyScore } from "../../../src/routes/loadSafetyScore";

const mockRequest = {
  body: {
    point: [37.801692, -122.261993],
  },
} as Request;

const mockResponse = {
  send: jest.fn().mockImplementation((data) => {
    console.log(data);
  }),
} as unknown as Response;

describe("Load safety score", () => {
  /*it("should response with a number", () => {
    let test: LoadSafetyScore = new LoadSafetyScore();

    test.handler(mockRequest, mockResponse);
  });*/
});
