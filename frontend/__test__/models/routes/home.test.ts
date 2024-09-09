import { Request, Response } from "express";
import { Home } from "../../../src/routes/home";
import exp from "constants";

const mockRequest = {

} as Request;

const mockResponse = {
    send: jest.fn(),
} as unknown as Response;

describe('Home Class', () => {
    /*it('should return string "HELLO HOME"', () => {
        let testClass:Home = new Home();

        testClass.handler(mockRequest, mockResponse);
        expect(mockResponse.send).toHaveBeenCalledWith("HELLO HOME");
    })*/
})