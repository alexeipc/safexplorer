import { NextFunction, Request, Response } from "express";

/**
 * An interface for what a middleware need
 */
export interface Middleware {
    /**
     * Determine the purpose of the middleware inside this function
     * @param req the request
     * @param res the response
     * @param next the next ware in the pipline
     */
    getAction(req: Request, res: Response, next: NextFunction): void; 
}