import { Request, Response } from "express";
import exp from "constants";
import { LoadCrimeMap } from "../../../src/routes/loadCrimeMap";

const mockRequest = {
  body: {
    topLeft: [29.02622620047136, -82.26965322934738],
    bottomRight: [29.24057794098324, -82.11086645564386],
  },
} as Request;

const mockResponse = {
  send: jest.fn().mockImplementation((data) => {
    console.log(data[0]);
  }),
} as unknown as Response;

describe("Load Crime Map", () => {
  /*it("should response with a dictionary", () => {
    let test: LoadCrimeMap = new LoadCrimeMap();

    // test.handler(mockRequest, mockResponse);
  });*/
});
